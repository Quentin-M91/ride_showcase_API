import express from 'express';
import dotenv from 'dotenv';
import { testConnection } from './config/database';
import { syncDatabase } from './models/syncModels';
import userRoutes from './routes/userRoutes';
import vehiculeRoutes from './routes/vehiculeRoutes';
import swaggerUi from "swagger-ui-express";
import swaggerDocs from './config/swagger';
import { v2 as cloudinary } from 'cloudinary';
import cors from 'cors';

//Création d'un serveur Express
const app = express();

//chargement des variables d'environnement
dotenv.config();

// Connecter à Sequelize
testConnection().then(() => syncDatabase());

(async function () {

    // Configuration
    cloudinary.config({
        cloud_name: 'dm7287jxr',
        api_key: '934429782157822',
        api_secret: 'JwBMn9nZaBEqu2qdp9XazlQxeZc' // Click 'View API Keys' above to copy your API secret
    });
})();

// Activer CORS uniquement pour une seule origine
//curl ifconfig.me pour connaître l'ip publique de votre pc
const corsOptions = {
    origin: process.env.CLIENT_URL || "http://localhost:4200", // Placer le domaine du client pour l'autoriser
    methods: 'GET,POST,DELETE,PUT', // Restreindre les méthodes autorisées
    allowedHeaders: 'Content-Type,Authorization', // Définir les en-têtes acceptés
    credentials: true // Autoriser les cookies et les headers sécurisés
};
app.use(cors(corsOptions));

//Définition du port du serveur
const PORT = 3000;

console.log("lancement du serveur")

//Config du serveur par défaut
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

//Ajouter les routes ici
app.use('/users', userRoutes)
app.use('/vehicule', vehiculeRoutes)

// Swagger route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//app.listen indique au serveur d'écouter les requêtes HTTP arrivant sur le
//port indiqué
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});