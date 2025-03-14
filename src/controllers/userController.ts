import { Request, Response } from "express";
import Utilisateur from "../models/Utilisateur.model";
import sequelize from "../config/database";
import { hashPassword, verifyPassword } from '../utils/pwdUtils';
import { generateToken } from '../utils/JWTUtils';
import { validateSchema } from '../utils/joiUtils';
import { loginSchema } from "../JoiValidators/authValidators";

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

        //hashage
        const hashedPassword = await hashPassword(password);

        const utilisateur = await Utilisateur.create({ nom, prenom, username, email, hashedPassword });

        // // Création du garage pour cet utilisateur
        // const garage = await Garage.create({ utilisateur_id: utilisateur.id });

        //on supprime le hashed password
        utilisateur.hashedPassword = '';

        res.json(utilisateur);
        // res.status(201).json({ message: "Utilisateur créé avec succès", utilisateur, garage });
    } catch (err: any) {
        //erreur de duplication 
        if (err.code === 11000) {
            res.status(400).json({ message: 'Cet email ou username est déjà utilisé' });
            return
        }
        // Gestion des erreurs
        res.status(500).json({ message: 'Erreur interne', error: err.message });

    }
}


export async function login(req: Request, res: Response) {
    const { username, email, password } = validateSchema(req, loginSchema);
    try {

        if (!email && !username) {
            res.status(400).json({ message: "Email ou username requis" });
            return;
        }

        const whereClause = username ? { username } : { email };
        const utilisateur = await Utilisateur.findOne({ where: whereClause });

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
        res.cookie("jwt", token, {httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production"});
        res.status(200).json({ message: 'Connexion réussie' });

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





// export async function register(req: Request, res: Response) {
//     try {
//         // Validation des champs
//         const { nom, prenom, username, email, password } = req.body;
//         if (!nom || !prenom || !email || !password) {
//             res.status(400).send('Champs manquant: nom, prenom, username, email ou mot de passe');
//             return
//         }

//         //hashage
//         const hashedPassword = await hashPassword(password);

//         const utilisateur = await Utilisateur.create({ nom, prenom, username, email, hashedPassword });

//         // Création du garage pour cet utilisateur
//         const garage = await Garage.create({ utilisateur_id: utilisateur.id, vehicule_id: null }); // vehicule_id is now nullable

//         //on supprime le hashed password
//         utilisateur.hashedPassword = '';

//         // res.json(utilisateur);
//         res.status(201).json({ message: "Utilisateur créé avec succès", utilisateur, garage });
//     } catch (err: any) {
//         //erreur de duplication 
//         if (err.code === 11000) {
//             res.status(400).json({ message: 'Cet email ou username est déjà utilisé' });
//             return
//         }
//         // Gestion des erreurs
//         res.status(500).json({ message: 'Erreur interne', error: err.message });

//     }
// }