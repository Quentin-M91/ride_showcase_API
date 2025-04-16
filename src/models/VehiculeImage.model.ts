import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Vehicule from "./Vehicule.model";

// Définition des attributs d'une image de véhicule
interface VehiculeImageAttributes {
    id?: number;
    url: string;
    public_id: string; // ID retourné par Cloudinary
    Vehicule_id: number;
}

class VehiculeImage extends Model<VehiculeImageAttributes> implements VehiculeImageAttributes {
    public id!: number;
    public url!: string;
    public public_id!: string;
    public Vehicule_id!: number; // Clé étrangère vers le véhicule
}

VehiculeImage.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        public_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Vehicule_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'vehicules',
                key: 'id',
            },
            onDelete: 'CASCADE', // Supprime les images si le véhicule est supprimé
        },
    },
    {
        sequelize,
        tableName: "vehicule_images",
        timestamps: false,
    }
);

// Associations
Vehicule.hasMany(VehiculeImage, { foreignKey: "Vehicule_id", as: "images" });
VehiculeImage.belongsTo(Vehicule, { foreignKey: "Vehicule_id" });

export default VehiculeImage;