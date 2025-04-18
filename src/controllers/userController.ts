import { Request, Response } from "express";
import Utilisateur from "../models/Utilisateur.model";
import sequelize from "../config/database";
import { hashPassword, verifyPassword } from '../utils/pwdUtils';
import { generateToken } from '../utils/JWTUtils';
import { validateSchema } from '../utils/joiUtils';
import { loginSchema } from "../JoiValidators/authValidators";
import QRCode from "qrcode";
import QRCodeModel from "../models/QRCode.model";
import { randomBytes } from 'crypto';
import { AuthenticatedRequest } from "../middlewares/verifyTokenMiddleware";

export async function getAllUsers(req: Request, res: Response) {
    try {
        const utilisateurs = await Utilisateur.findAll();
        res.send(utilisateurs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function register(req: Request, res: Response) {
    try {
        // Validation des champs
        const { nom, prenom, username, email, password } = req.body;
        if (!nom || !prenom || !email || !password) {
            res.status(400).send('Champs manquant: nom, prenom, username, email ou mot de passe');
            return
        }

        // Hashage du MDP
        const hashedPassword = await hashPassword(password);

        // Token pour la vue publique
        const viewToken = randomBytes(24).toString('hex');

        // Création de l'utilisateur
        const utilisateur = await Utilisateur.create({ nom, prenom, username, email, hashedPassword, public_view_token: viewToken });
        console.log(utilisateur);

        // Génération de l'URL du profil
        const publicProfileUrl = `http://localhost:4200/profil-public?token=${viewToken}`;

        // Génération du QR Code
        const qrCodeData = await QRCode.toDataURL(publicProfileUrl);
        console.log(publicProfileUrl);

        // Enregistrement du QR Code dans la base de données
        const qrCode = await QRCodeModel.create({
            Code: qrCodeData,
            UtilisateurID: utilisateur.id,
        });

        // Supprimer le hashed password
        utilisateur.hashedPassword = '';

        // Envoyer la réponse avec le QR Code
        res.status(201).json({
            message: "Utilisateur créé avec succès",
            utilisateur,
            qrCode: qrCode.Code, // QR Code sous forme de base64
        });

    } catch (err: any) {
        //erreur de duplication 
        if (err.code === "SequelizeUniqueConstraintError") {
            res.status(400).json({ message: 'Cet email ou username est déjà utilisé' });
            return;
        }
        // Gestion des erreurs
        res.status(500).json({ message: 'Erreur interne', error: err.message });

    }
}


export async function login(req: Request, res: Response) {
    try {
        
        const {email, password } = validateSchema(req, loginSchema);

        // Vérification de l'utilisateur
        const utilisateur = await Utilisateur.findOne({ where: email ? { email } : {} });

        if (!email) {
            res.status(400).json({ message: "Email requis" });
            return;
        }

        if (!password) {
            res.status(400).json({ message: "Mot de passe requis" });
            return;
        }

        if (!utilisateur) {
            res.status(404).json({ message: 'Utilisateur non trouvé' });
            return
        }

        const isPasswordValid = await verifyPassword(password, utilisateur.hashedPassword);

        if (!isPasswordValid) {
            res.status(401).json({ message: 'Mot de passe incorrect' });
            return
        }

        const token = generateToken({ id: utilisateur.id, nom: utilisateur.nom, role: utilisateur.role });
        res.cookie("jwt", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
        res.status(200).json({ message: 'Connexion réussie', token});

    } catch (error: any) {
        res.status(500).json({ message: error.message });
        console.error("Erreur dans login :", error);
        return
    }
}


export async function modifyUser(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { nom, prenom, email } = req.body;

        const utilisateur = await Utilisateur.findByPk(id);
        if (!utilisateur) {
            res.status(404).json({ message: "Utilisateur non trouvé" });
            return
        }

        // Mise à jour des champs fournis
        if (nom) utilisateur.nom = nom;
        if (prenom) utilisateur.prenom = prenom;
        if (email) utilisateur.email = email;

        await utilisateur.save();
        res.status(200).json({ message: "Utilisateur modifié avec succès", utilisateur });
    } catch (error) {
        console.error("Erreur lors de la modification :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

export async function deleteUser(req: Request, res: Response) {
    try {
        const { id } = req.params;

        const utilisateur = await Utilisateur.findByPk(id);
        if (!utilisateur) {
            res.status(404).json({ message: "Utilisateur non trouvé" });
            return
        }

        await utilisateur.destroy();
        res.json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

export async function getQRCode(req: Request, res: Response) {
    try {
        const { userId } = req.params;

        // Vérifier si l'utilisateur existe
        const utilisateur = await Utilisateur.findByPk(userId);
        if (!utilisateur) {
            res.status(404).json({ message: "Utilisateur non trouvé" });
            return;
        }

        // Récupérer le QR Code
        const qrCode = await QRCodeModel.findOne({ where: { UtilisateurID: userId } });
        if (!qrCode) {
            res.status(404).json({ message: "QR Code non trouvé" });
            return;
        }

        // Envoyer le QR Code
        res.status(200).json({ qrCode: qrCode.Code });

    } catch (error: any) {
        res.status(500).json({ message: "Erreur interne", error: error.message });
        return;
    }
}

export async function getUserInfo(req: AuthenticatedRequest, res: Response) {

    //Récupère l'information de l'utilisateur quand il se connecte
    const userId = req.user?.id;
    
    if (!userId) {
        res.status(404).json({ message: "Utilisateur introuvable" });
        return
    }

    try {
        const utilisateur = await Utilisateur.findByPk(userId);
        if (!utilisateur) {
            res.status(404).json({ message: "Utilisateur introuvable en base" });
            return
        }
        
        res.send(utilisateur);

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function getProfilPublic(req: Request, res: Response) {
    try {
        const { token } = req.query;
        if (!token || typeof token !== 'string') {
            res.status(400).json({ message: "Token manquant" });
            return
        }

        const utilisateur = await Utilisateur.findOne({
            where: { public_view_token: token },
            attributes: ['id', 'nom', 'prenom', 'email', 'username'] // champs publics
        });

        if (!utilisateur) {
            res.status(404).json({ message: "Profil introuvable" });
            return
        }

        res.status(200).json({ utilisateur });

    } catch (error: any) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
}


/**
* Effectue une recherche avancée sur les utilisateurs.
* Filtrage par nom, email et date de création avec une requête SQL optimisée.
* URL : GET /users/search?nom=Dupont&email=dupont@example.com&createdAfter=2024-01-01
*/

export async function searchUsers(req: Request, res: Response) {
    try {
        const { nom, email, createdAfter } = req.query;
        //Créé une requête formatée pour que sequelize puisse insérer des variables à l'intérieur
        const query = `
SELECT id, nom, email, "createdAt"
FROM utilisateurs
WHERE
(:nom IS NULL OR nom ILIKE :nom) AND
(:email IS NULL OR email ILIKE :email) AND
(:createdAfter IS NULL OR "createdAt" >= :createdAfter)
ORDER BY nom ASC;
`;
        //insère dynamiquement les variables dans la requête et l'éxécute
        //sequelize.query avec replacements protège contre les injections sql
        const utilisateurs = await sequelize.query(query, {
            replacements: {
                nom: nom ? `%${nom}%` : null, // Recherche partielle insensible à la casse
                email: email ? `%${email}%` : null,
                createdAfter: createdAfter || null,
            },
            type: "SELECT"
        });
        res.json(utilisateurs);
    } catch (error: any) {
        console.error("Erreur lors de la recherche :", error);
        res.status(500).json({ message: error.message });
    }
}
