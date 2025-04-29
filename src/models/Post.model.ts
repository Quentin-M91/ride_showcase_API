import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Utilisateur from './Utilisateur.model';
import Like from './Like.model';

class Post extends Model {
    public id!: number;
    public content!: string;
    public imageUrl?: string;
    public createdAt!: Date;
    public updatedAt!: Date;
    public UtilisateurID!: number;
}

Post.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: true
        },
        UtilisateurID: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: 'posts',
        timestamps: true
    }
);

Utilisateur.hasMany(Post, { foreignKey: 'UtilisateurID' });
Post.belongsTo(Utilisateur, { foreignKey: 'UtilisateurID' });

// 🔥 AJOUT : Association avec "Like" et alias "Likers"
Utilisateur.belongsToMany(Post, { through: Like, foreignKey: 'UtilisateurID' });
Post.belongsToMany(Utilisateur, { through: Like, as: 'Likers', foreignKey: 'PostID' });

export default Post;