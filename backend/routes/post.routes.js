import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { createComment, createPost, deletePost, getFeedPosts, getPostById, likePost } from "../controller/post.controller.js";
const postRoutes = express.Router();


postRoutes.get("/",authenticate, getFeedPosts);
postRoutes.post("/create",authenticate, createPost);
postRoutes.post("/delete",authenticate, deletePost);
postRoutes.get("/:id",authenticate,getPostById);
postRoutes.post("/:id/comment",authenticate,createComment);
postRoutes.post("/:id/like",authenticate,likePost);

export default postRoutes;