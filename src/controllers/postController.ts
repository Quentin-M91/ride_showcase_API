import { Request, Response } from "express";
import Post from "../models/Post.model";
import Utilisateur from "../models/Utilisateur.model";
import { AuthenticatedRequest } from "../middlewares/verifyTokenMiddleware";
import Commentaire from "../models/Commentaire.model";
import Like from "../models/Like.model";

// Fils d'actualité

export async function getFeed(req: Request, res: Response) {
    try {
        const posts = await Post.findAll({
            include: [
                {
                    model: Utilisateur,
                    attributes: ['id', 'nom', 'prenom', 'username']
                },
                {
                    model: Utilisateur,
                    as: 'Likers',
                    attributes: ['id'],
                    through: { attributes: [] }
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Optionnel : convertir le résultat Sequelize en JSON si nécessaire
        const cleanPosts = posts.map(post => post.toJSON());

        res.json(cleanPosts);
    } catch (error) {
        console.error('Erreur dans getFeed :', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}

// Partie posts

export async function createPost(req: AuthenticatedRequest, res: Response) {
    const { content } = req.body;
    const utilisateurId = req.user?.id; // Ou récupéré dans un token
    const newPost = await Post.create({ content, UtilisateurID: utilisateurId });
    res.status(201).json(newPost);
}

export async function likePost(req: AuthenticatedRequest, res: Response) {
    const utilisateurId = req.user?.id;
    const postId = req.params.id;

    const alreadyLiked = await Like.findOne({ where: { PostID: postId, UtilisateurID: utilisateurId } });

    if (alreadyLiked) {
        await alreadyLiked.destroy(); // toggle = unlike
        res.json({ liked: false });
        return;
    }

    await Like.findOrCreate({ where: { UtilisateurID: utilisateurId, PostID: postId } });
    res.status(204).send();
}

export const deletePost = async (req: AuthenticatedRequest, res: Response) => {
    const postId = req.params.id;
    const userId = req.user?.id; // ID de l'utilisateur connecté (à partir du token JWT)

    const post = await Post.findByPk(postId);
    if (!post) {
        res.status(404).json({ message: "Post non trouvé" });
        return;
    }

    if (post.UtilisateurID !== userId) {
        res.status(403).json({ message: "Non autorisé à supprimer ce post" });
        return;
    }

    await post.destroy();
    res.status(200).json({ message: "Post supprimé" });
};

// Partie Commentaires

export async function getComments(req: Request, res: Response) {
    const postId = req.params.id;
    const comments = await Commentaire.findAll({
        where: { PostID: postId },
        include: [{ model: Utilisateur, attributes: ['nom', 'prenom'] }]
    });
    res.json(comments);
}

export async function addComment(req: AuthenticatedRequest, res: Response) {
    const utilisateurId = req.user?.id;
    const postId = req.params.id;
    const { contenu } = req.body;
    const comment = await Commentaire.create({ contenu, UtilisateurID: utilisateurId, PostID: postId });
    res.status(201).json(comment);
}

export const deleteComment = async (req: AuthenticatedRequest, res: Response) => {
    const { postId, commentId } = req.params;
    const userId = req.user?.id;

    const comment = await Commentaire.findOne({ where: { id: commentId, PostID: postId } });
    if (!comment) {
        res.status(404).json({ message: "Commentaire non trouvé" });
        return;
    }

    if (comment.UtilisateurID !== userId) {
        res.status(403).json({ message: "Non autorisé à supprimer ce commentaire" });
        return;
    }

    await comment.destroy();
    res.status(200).json({ message: "Commentaire supprimé" });
};