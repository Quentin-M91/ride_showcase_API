import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import Vehicule from "./Vehicule.model";

// Définition des attributs d'un utilisateur
interface UtilisateurAttributes {
    id?: number;
    nom: string;
    prenom: string;
    username: string;
    email: string;
    role?: 'Admin' | 'Utilisateur';
    hashedPassword: string;
    garage?: number[];
    public_view_token: string;
    createdAt?: Date;
    updatedAt?: Date;
}

class Utilisateur extends Model<UtilisateurAttributes>
    implements UtilisateurAttributes {
    public id!: number;
    public nom!: string;
    public prenom!: string;
    public username!: string;
    public email!: string;
    public role!: 'Admin' | 'Utilisateur';
    public hashedPassword!: string;
    public garage!: number[];
    public public_view_token!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Utilisateur.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nom: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        prenom: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Utilisateur',
            validate: {
                isIn: [['Admin', 'Utilisateur']],
            },
        },
        hashedPassword: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        garage: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'vehicules', // Nom de la table utilisateur
                key: 'id'
            },
        },
        public_view_token: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize,
        tableName: "utilisateurs",
        timestamps: true,
    }
);



export default Utilisateur;
