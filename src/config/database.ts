import { Sequelize } from "sequelize";
import dotenv from 'dotenv';

//chargement des variables d'environnement
dotenv.config();

console.log("🔍 DATABASE_URL utilisée par Sequelize :", process.env.DATABASE_URL);

const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
    dialect: "postgres",
    logging: false, // Désactiver les logs SQL (optionnel)
});

export const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log("Connecté à PostgreSQL avec Sequelize");
    } catch (error) {
        console.error("Erreur de connexion à PostgreSQL :", error);
    }
};

export default sequelize;