import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Post from './Post.model';
import Utilisateur from './Utilisateur.model';

class Commentaire extends Model {
    public id!: number;
    public contenu!: string;
    public PostID!: number;
    public UtilisateurID!: number;
    public createdAt!: Date;
    public updatedAt!: Date;
}

Commentaire.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        contenu: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        PostID: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        UtilisateurID: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: 'commentaires',
        timestamps: true
    }
);

Commentaire.belongsTo(Post, { foreignKey: 'PostID' });
Commentaire.belongsTo(Utilisateur, { foreignKey: 'UtilisateurID' });

export default Commentaire;