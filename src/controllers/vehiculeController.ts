import { Request, Response } from "express";
import Vehicule from "../models/Vehicule.model";
import { v2 as cloudinary } from "cloudinary";
import { AuthenticatedRequest } from "../middlewares/verifyTokenMiddleware";
import VehiculeImage from "../models/VehiculeImage.model";

export async function getAllVehicule(req: Request, res: Response) {
    try {
        const vehicule = await Vehicule.findAll();
        res.send(vehicule);
    } catch (err: any) {
        console.error('Erreur lors de la récupération des véhicules : ', err)
        res.status(500).json({ message: 'Erreur lors de la récupération des véhicules' })

    }
}

// Créer un véhicule d'un utilisateur
export async function createVehicule(req: Request, res: Response): Promise<void> {
    try {
        const { marque, modele, annee, type_de_vehicule, couleur, type_de_moteur, puissance, transmission, modification_du_vehicule, images } = req.body;
        const utilisateurId = (req as any).user?.id; // Supposons que l'ID utilisateur est stocké ici après l'authentification

        if (!utilisateurId) {
            res.status(401).json({ message: "Utilisateur non authentifié" });
            return;
        }

        if (!marque || !modele || !annee || !type_de_vehicule || !couleur || !type_de_moteur || !puissance || !transmission || !modification_du_vehicule) {
            res.status(400).json({ message: "Tous les champs sont requis." });
            return;
        }

        if (images && images.length > 5) {
            res.status(400).json({ error: "Maximum 5 images autorisées" });
            return;
        }

        const vehicule = await Vehicule.create({
            marque, modele, annee, type_de_vehicule, couleur, type_de_moteur, puissance, transmission, modification_du_vehicule,
            Utilisateur_id: utilisateurId, // Association avec l'utilisateur
        });


        // 2. Upload des images en base64 sur Cloudinary
        if (images && Array.isArray(images)) {
            for (const imgBase64 of images) {
                const uploadResult = await cloudinary.uploader.upload(imgBase64, {
                    folder: "vehicules",
                });

                await VehiculeImage.create({
                    url: uploadResult.secure_url,
                    public_id: uploadResult.public_id,
                    Vehicule_id: vehicule.id,
                });
            }
        }

        // 3. Récupération avec images
        const imagesAssoc = await VehiculeImage.findAll({ where: { Vehicule_id: vehicule.id } });

        res.status(201).json({ message: "Véhicule créé avec succès", vehicule: { ...vehicule.toJSON(), images: imagesAssoc } });

    } catch (err: any) {
        res.status(500).json({ message: "Erreur interne", error: err.message });
    }
}

// Pouvoir modifier un véhicule d'un utilisateur
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

// Supprimer un véhicule d'un utilisateur
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

// Permettre à un utilisateur d'uploader plusieurs images pour un véhicule
export const uploadVehiculeImages = async (req: Request, res: Response): Promise<void> => {
    try {
        const { images } = req.body; // tableau base64
        const vehiculeId = req.params.vehiculeId;

        if (!images || !Array.isArray(images) || images.length === 0) {
            res.status(400).json({ error: 'Aucune image envoyée' });
            return;
        }

        if (images.length > 5) {
            res.status(400).json({ error: 'Maximum 5 images autorisées' });
            return;
        }

        const vehicule = await Vehicule.findByPk(vehiculeId);
        if (!vehicule) {
            res.status(404).json({ error: 'Véhicule non trouvé' });
            return;
        }

        const uploadedImages = [];

        for (const base64Image of images) {
            const result = await cloudinary.uploader.upload(base64Image, {
                folder: 'vehicules',
            });

            const imageRecord = await VehiculeImage.create({
                url: result.secure_url,
                public_id: result.public_id,
                Vehicule_id: vehicule.id,
            });

            uploadedImages.push(imageRecord);
        }

        res.status(200).json({
            message: 'Images uploadées avec succès',
            images: uploadedImages,
        });
    } catch (error) {
        console.error('Erreur upload:', error);
        res.status(500).json({ error: "Erreur lors de l'upload" });
    }
};

// Supprimer les images d'un véhicule d'un utilisateur
export const deleteVehiculeImage = async (req: Request, res: Response) => {
    try {
        const image = await VehiculeImage.findByPk(req.params.id);

        if (!image) {
            res.status(404).json({ message: 'Image non trouvée' });
            return
        }

        await cloudinary.uploader.destroy(image.public_id);
        await image.destroy();

        res.status(200).json({ message: 'Image supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Récupérer les véhicules d'un utilisateur
export const getVehiculesByUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const utilisateurId = req.user?.id;

        if (!utilisateurId) {
            res.status(401).json({ message: "Utilisateur non authentifié" });
            return;
        }

        const vehicules = await Vehicule.findAll({
            where: { Utilisateur_id: utilisateurId },
            include: [{ model: VehiculeImage, as: 'images' }],
        });

        res.status(200).json(vehicules);
    } catch (error) {
        console.error("Erreur récupération des véhicules par utilisateur :", error);
        res.status(500).json({ message: "Erreur serveur" });
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
