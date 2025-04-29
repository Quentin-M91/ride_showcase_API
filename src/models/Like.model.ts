import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Utilisateur from './Utilisateur.model';
import Post from './Post.model';

class Like extends Model {
    public id!: number;
    public PostID!: number;
    public UtilisateurID!: number;
    public createdAt!: Date;
    public updatedAt!: Date;
}

Like.init(
    {
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
    },
    {
        sequelize,
        tableName: 'likes',
        timestamps: false
    }
);

export default Like;