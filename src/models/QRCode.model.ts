import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Utilisateur from "./Utilisateur.model";

interface QRCodeAttributes {
    id?: number;
    Code: string;
    UtilisateurID?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

class QRCode extends Model<QRCodeAttributes> implements QRCodeAttributes {
    public id!: number;
    public Code!: string;
    public UtilisateurID!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

QRCode.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        Code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        UtilisateurID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true, // 🔥 Relation 1:1 : un utilisateur ne peut avoir qu'un seul QRCode
            references: {
                model: Utilisateur,
                key: "id",
            },
            onDelete: "CASCADE",
        },
    },
    {
        sequelize,
        tableName: "QRCodes",
        timestamps: true,
    }
);

// Définition de la relation 1:1
Utilisateur.hasOne(QRCode, { foreignKey: "utilisateur_id" });
QRCode.belongsTo(Utilisateur, { foreignKey: "utilisateur_id" });

export default QRCode;