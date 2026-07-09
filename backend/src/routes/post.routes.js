import { Router } from "express";
import {
    createPost,
    getUserPosts,
    updatePost,
    deletePost,
    getAllPosts,
} from "../controllers/post.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Secure all post routes
router.use(verifyJWT);

// Route: Create a post / Get global post feed
router.route("/").post(createPost).get(getAllPosts);

// Route: Get user posts
router.route("/user/:userId").get(getUserPosts);

// Route: Update or delete post
router.route("/:postId").patch(updatePost).delete(deletePost);

export default router;
