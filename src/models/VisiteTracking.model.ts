import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import QRCode from "./QRCode.model";
import Utilisateur from "./Utilisateur.model";


interface VisitTrackingAttributes {
    VisitID?: number;
    QRCodeID: number;
    UtilisateurID: number;
    VisitDate: Date;
    IPAddress: string;
    createdAt?: Date;
    updatedAt?: Date;
}

class VisitTracking extends Model<VisitTrackingAttributes> implements VisitTrackingAttributes {
    public VisitID!: number;
    public QRCodeID!: number;
    public UtilisateurID!: number;
    public VisitDate!: Date;
    public IPAddress!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

VisitTracking.init(
    {
        VisitID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        QRCodeID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true, // 🔥 Relation 1:1 
            references: {
                model: QRCode,
                key: "id",
            },
        },
        UtilisateurID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true, // 🔥 Relation 1:1 
            references: {
                model: Utilisateur,
                key: "id",
            },
        },
        VisitDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        IPAddress: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "visit_tracking",
        timestamps: true,
    }
);

// Définition de la relation 1:1
Utilisateur.hasMany(VisitTracking, { foreignKey: "Utilisateur_id" });
VisitTracking.belongsTo(Utilisateur, { foreignKey: "Utilisateur_id" });

QRCode.hasMany(VisitTracking, { foreignKey: "QRCode_id" });
VisitTracking.belongsTo(QRCode, { foreignKey: "QRCode_id" });

export default VisitTracking;