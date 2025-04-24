import express from "express";
import { isAdmin } from "../middlewares/verifyAdminMiddleware";
import { verifyTokenMiddleware } from "../middlewares/verifyTokenMiddleware";
import { addComment, createPost, getComments, getFeed, likePost } from "../controllers/postController";

const router = express.Router();

router.get('/feed', getFeed);

router.post('/posts', verifyTokenMiddleware, createPost);

router.post('/posts/:id/like', verifyTokenMiddleware, likePost);

router.get('/posts/:id/comments', getComments);

router.post('/posts/:id/comments', verifyTokenMiddleware, addComment);

export default router;