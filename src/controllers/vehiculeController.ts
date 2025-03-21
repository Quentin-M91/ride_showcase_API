import { Request, Response } from "express";
import Vehicule from "../models/Vehicule.model";
import { v2 as cloudinary } from "cloudinary";

export async function getAllVehicule(req: Request, res: Response) {
    try {
        const vehicule = await Vehicule.findAll();
        res.send(vehicule);
    } catch (err: any) {
        console.error('Erreur lors de la récupération des véhicules : ', err)
        res.status(500).json({ message: 'Erreur lors de la récupération des véhicules' })

    }
}

export async function createVehicule(req: Request, res: Response): Promise<void> {
    try {
        const { marque, modele, annee, type_de_vehicule, couleur, type_de_moteur, puissance, transmission, modification_du_vehicule } = req.body;
        const utilisateurId = (req as any).user?.id; // Supposons que l'ID utilisateur est stocké ici après l'authentification

        if (!utilisateurId) {
            res.status(401).json({ message: "Utilisateur non authentifié" });
            return;
        }

        if (!marque || !modele || !annee || !type_de_vehicule || !couleur || !type_de_moteur || !puissance || !transmission || !modification_du_vehicule) {
            res.status(400).json({ message: "Tous les champs sont requis." });
            return;
        }

        const vehicule = await Vehicule.create({
            marque, modele, annee, type_de_vehicule, couleur, type_de_moteur, puissance, transmission, modification_du_vehicule,
            Utilisateur_id: utilisateurId, // Association avec l'utilisateur
        });

        res.status(201).json({ message: "Véhicule créé avec succès", vehicule });

    } catch (err: any) {
        res.status(500).json({ message: "Erreur interne", error: err.message });
    }
}


export const updateVehicule = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { marque, modele, annee, type_de_vehicule, couleur, type_de_moteur, puissance, transmission, modification_du_vehicule } = req.body;

        const vehicule = await Vehicule.findByPk(id);
        if (!vehicule) {
            res.status(404).json({ message: "Véhicule non trouvé" });
            return
        }

        if (marque) vehicule.marque = marque;
        if (modele) vehicule.modele = modele;
        if (annee) vehicule.annee = annee;
        if (type_de_vehicule) vehicule.type_de_vehicule = type_de_vehicule;
        if (couleur) vehicule.couleur = couleur;
        if (type_de_moteur) vehicule.type_de_moteur = type_de_moteur;
        if (puissance) vehicule.puissance = puissance;
        if (transmission) vehicule.transmission = transmission;
        if (modification_du_vehicule) vehicule.modification_du_vehicule = modification_du_vehicule;

        await vehicule.save();

        res.status(200).json({ message: "Véhicule modifié avec succès", vehicule });
    } catch (error) {
        console.error("Erreur lors de la modification :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

export async function deleteVehicule(req: Request, res: Response) {
    try {
        const { id } = req.params;

        const vehicule = await Vehicule.findByPk(id);
        if (!vehicule) {
            res.status(404).json({ message: "Véhicule non trouvé" });
            return
        }

        await vehicule.destroy();
        res.json({ message: "Véhicule supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

export const uploadVehiculeImage = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ error: "Aucune image envoyée" });
            return;
        }

        // Upload sur Cloudinary
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ folder: "vehicules" }, (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
            if (req.file) {
                stream.end(req.file.buffer);
            } else {
                throw new Error("La mémoire tampon du fichier est indéfinie");
            }
        });

        const imageUrl = (result as any).secure_url;

        // Mise à jour du véhicule avec l'image
        const vehiculeId = req.params.vehiculeId;
        const vehicule = await Vehicule.findByPk(vehiculeId);

        if (!vehicule) {
            res.status(404).json({ error: "Véhicule non trouvé" });
            return;
        }

        vehicule.imageURL = imageUrl;
        await vehicule.save();

        res.status(200).json({ message: "Image uploadée avec succès", imageUrl });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de l'upload" });
    }
};

// export async function searchVehicule(req: Request, res: Response) {
//     try {
//         const { marque, modele, annee, type_de_vehicule, couleur, type_de_moteur, puissance, transmission, modification_du_vehicule } = req.body;

//         const vehicule = await Vehicule.findAll({
//             where: {
//                 marque,
//                 modele,
//                 annee,
//                 type_de_vehicule,
//                 couleur,
//                 type_de_moteur,
//                 puissance,
//                 transmission,
//                 modification_du_vehicule
//             }
//         });

//         if (vehicule.length === 0) {
//             res.status(404).json({ message: "Aucun véhicule trouvé" });
//             return;
//         }

//         res.json(vehicule);
//     } catch (error) {
//         console.error("Erreur lors de la recherche :", error);
//         res.status(500).json({ message: "Erreur serveur" });
//     }
// }
