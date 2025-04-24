import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Utilisateur from './Utilisateur.model';
import Post from './Post.model';

class Like extends Model { }

Like.init({
    UtilisateurID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    PostID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    }
}, {
    sequelize,
    tableName: 'likes',
    timestamps: false
});

Utilisateur.belongsToMany(Post, { through: Like, foreignKey: 'UtilisateurID' });
Post.belongsToMany(Utilisateur, { through: Like, foreignKey: 'PostID' });

export default Like;