import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Utilisateur from "./Utilisateur.model";

// Définition des attributs d'un véhicule
interface VehiculeAttributes {
    id?: number;
    marque: string;
    modele: string;
    annee: number;
    type_de_vehicule: string;
    couleur: string;
    type_de_moteur: string;
    puissance: number;
    transmission: string;
    modification_du_vehicule: string;
    Utilisateur_id: number;
    imageURL?: string;
}

class Vehicule extends Model<VehiculeAttributes> implements VehiculeAttributes {
    public id!: number;
    public marque!: string;
    public modele!: string;
    public annee!: number;
    public type_de_vehicule!: string;
    public couleur!: string;
    public type_de_moteur!: string;
    public puissance!: number;
    public transmission!: string;
    public modification_du_vehicule!: string;
    public Utilisateur_id!: number; // Clé étrangère
    public imageURL!: string; // URL de l'image du véhicule    
}

Vehicule.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        marque: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        modele: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        annee: {
            type: DataTypes.INTEGER, 
            allowNull: false,
        },
        type_de_vehicule: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        couleur: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type_de_moteur: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        puissance: {
            type: DataTypes.INTEGER, 
            allowNull: false,
            validate: {
                min: 0,
            },
        },
        transmission: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        modification_du_vehicule: {
            type: DataTypes.TEXT, 
            allowNull: false,
        },
        Utilisateur_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'utilisateurs', // Nom de la table utilisateur
                key: 'id'
            },
        },
        imageURL: {
            type: DataTypes.STRING,
            allowNull: true
        }, // URL de l'image du véhicule
    },
    {
        sequelize,
        tableName: "vehicules",
        timestamps: false,
    }
);

Utilisateur.hasMany(Vehicule, { foreignKey: "Utilisateur_id" });
Vehicule.belongsTo(Utilisateur, { foreignKey: "Utilisateur_id" });

export default Vehicule;
