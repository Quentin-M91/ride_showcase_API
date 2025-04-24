import { Request, Response } from "express";
import Post from "../models/Post.model";
import Utilisateur from "../models/Utilisateur.model";
import { AuthenticatedRequest } from "../middlewares/verifyTokenMiddleware";
import Commentaire from "../models/Commentaire.model";
import Like from "../models/Like.model";

export async function getFeed(req: Request, res: Response) {
    const posts = await Post.findAll({
        include: [{ model: Utilisateur, attributes: ['id', 'nom', 'prenom', 'username'] }],
        order: [['createdAt', 'DESC']]
    });
    res.json(posts);
}

export async function createPost(req: AuthenticatedRequest, res: Response) {
    const { content } = req.body;
    const utilisateurId = req.user?.id; // Ou récupéré dans un token
    const newPost = await Post.create({ content, UtilisateurID: utilisateurId });
    res.status(201).json(newPost);
}

export async function likePost(req: AuthenticatedRequest, res: Response) {
    const utilisateurId = req.user?.id;
    const postId = req.params.id;
    await Like.findOrCreate({ where: { UtilisateurID: utilisateurId, PostID: postId } });
    res.status(204).send();
}

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