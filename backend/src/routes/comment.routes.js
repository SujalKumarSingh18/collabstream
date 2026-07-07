import { Router } from "express";
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Secure all comment routes
router.use(verifyJWT);

// Route: Get video comments and add a comment
router.route("/:videoId").get(getVideoComments).post(addComment);

// Route: Delete or edit comment
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router;
