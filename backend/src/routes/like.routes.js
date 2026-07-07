import { Router } from "express";
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    togglePostLike,
} from "../controllers/like.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Secure all like routes
router.use(verifyJWT);

// Route: Toggle video like
router.route("/toggle/v/:videoId").post(toggleVideoLike);

// Route: Toggle comment like
router.route("/toggle/c/:commentId").post(toggleCommentLike);

// Route: Toggle post like
router.route("/toggle/p/:postId").post(togglePostLike);

// Route: Get liked videos list
router.route("/videos").get(getLikedVideos);

export default router;
