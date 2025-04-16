import express from "express";
import { getAllVehicule, createVehicule, updateVehicule, deleteVehicule, uploadVehiculeImages, getVehiculesByUser, deleteVehiculeImage } from "../controllers/vehiculeController";
import { isAdmin } from "../middlewares/verifyAdminMiddleware";
import { verifyTokenMiddleware } from "../middlewares/verifyTokenMiddleware";
import upload from "../middlewares/multerMiddlewares";

const router = express.Router();

/**
 * @swagger
 * /vehicules/all:
 *   get:
 *     summary: Récupérer la liste de tous les véhicules
 *     description: Retourne une liste de tous les véhicules enregistrés dans la base de données.
 *     tags:
 *       - Véhicules
 *     responses:
 *       200:
 *         description: Liste des véhicules récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   marque:
 *                     type: string
 *                     example: "Toyota"
 *                   modele:
 *                     type: string
 *                     example: "Corolla"
 *                   annee:
 *                     type: integer
 *                     example: 2020
 *       500:
 *         description: Erreur lors de la récupération des véhicules.
 */
router.get("/all", verifyTokenMiddleware, getAllVehicule);

/**
 * @swagger
 * /vehicules/creation:
 *   post:
 *     summary: Créer un nouveau véhicule
 *     description: Ajoute un véhicule à la base de données en fournissant toutes ses caractéristiques.
 *     tags:
 *       - Véhicules
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - marque
 *               - modele
 *               - annee
 *               - type_de_vehicule
 *               - couleur
 *               - type_de_moteur
 *               - puissance
 *               - transmission
 *               - modification_du_vehicule
 *             properties:
 *               marque:
 *                 type: string
 *                 example: "Toyota"
 *               modele:
 *                 type: string
 *                 example: "Corolla"
 *               annee:
 *                 type: integer
 *                 example: 2020
 *               type_de_vehicule:
 *                 type: string
 *                 example: "Berline"
 *               couleur:
 *                 type: string
 *                 example: "Rouge"
 *               type_de_moteur:
 *                 type: string
 *                 example: "Essence"
 *               puissance:
 *                 type: integer
 *                 example: 150
 *               transmission:
 *                 type: string
 *                 example: "Automatique"
 *               modification_du_vehicule:
 *                 type: string
 *                 example: "Kit carrosserie sport"
 *     responses:
 *       201:
 *         description: Véhicule créé avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 marque:
 *                   type: string
 *                   example: "Toyota"
 *                 modele:
 *                   type: string
 *                   example: "Corolla"
 *                 annee:
 *                   type: integer
 *                   example: 2020
 *       400:
 *         description: Requête invalide - Champs obligatoires manquants.
 *       500:
 *         description: Erreur interne du serveur.
 */
router.post("/creation", verifyTokenMiddleware, createVehicule);

/**
 * @swagger
 * /vehicules/modification/{id}:
 *   put:
 *     summary: Mettre à jour un véhicule
 *     description: Met à jour les informations d'un véhicule existant en utilisant son ID.
 *     tags:
 *       - Véhicules
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du véhicule à mettre à jour.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               marque:
 *                 type: string
 *                 example: "Toyota"
 *               modele:
 *                 type: string
 *                 example: "Corolla"
 *               annee:
 *                 type: integer
 *                 example: 2020
 *               type_de_vehicule:
 *                 type: string
 *                 example: "SUV"
 *               couleur:
 *                 type: string
 *                 example: "Noir"
 *               type_de_moteur:
 *                 type: string
 *                 example: "Diesel"
 *               puissance:
 *                 type: integer
 *                 example: 180
 *               transmission:
 *                 type: string
 *                 example: "Manuelle"
 *               modification_du_vehicule:
 *                 type: string
 *                 example: "Nouveaux pneus sport"
 *     responses:
 *       200:
 *         description: Véhicule mis à jour avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Véhicule modifié avec succès"
 *                 vehicule:
 *                   type: object
 *       404:
 *         description: Véhicule non trouvé.
 *       500:
 *         description: Erreur serveur.
 */
router.put("/modification/:id", verifyTokenMiddleware, updateVehicule);

/**
 * @swagger
 * /vehicules/suppression/{id}:
 *   delete:
 *     summary: Supprimer un véhicule
 *     description: Supprime un véhicule en fonction de son ID.
 *     tags:
 *       - Véhicules
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du véhicule à supprimer.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Véhicule supprimé avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Véhicule supprimé avec succès"
 *       404:
 *         description: Véhicule non trouvé.
 *       500:
 *         description: Erreur serveur.
 */
router.delete("/suppression/:id",verifyTokenMiddleware,deleteVehicule);

router.post("/:vehiculeId/images", uploadVehiculeImages);

router.delete("/images/:id",verifyTokenMiddleware, deleteVehiculeImage);

router.get('/user',verifyTokenMiddleware, getVehiculesByUser);

export default router;