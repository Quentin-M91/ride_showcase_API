import express from "express";
import { isAdmin } from "../middlewares/verifyAdminMiddleware";
import { verifyTokenMiddleware } from "../middlewares/verifyTokenMiddleware";
import { addComment, createPost, deleteComment, deletePost, getComments, getFeed, likePost } from "../controllers/postController";

const router = express.Router();

router.get('/feed', getFeed);

router.post('/posts', verifyTokenMiddleware, createPost);

router.delete('/posts/:id', verifyTokenMiddleware, deletePost);

router.post('/posts/:id/like', verifyTokenMiddleware, likePost);

router.get('/posts/:id/comments', getComments);

router.post('/posts/:id/comments', verifyTokenMiddleware, addComment);

router.delete('/posts/:postId/comments/:commentId', verifyTokenMiddleware, deleteComment);

export default router;