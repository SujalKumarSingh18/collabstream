import { Router } from "express";
import {
    getChannelStats,
    getChannelVideos
} from "../controllers/dashboard.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Secure dashboard routes with JWT auth
router.use(verifyJWT);

/**
 * Task: Define routes for Creator Dashboard analytics.
 * 
 * TODO:
 * 1. Define GET "/stats" to fetch overall channel and engagement statistics.
 * 2. Define GET "/videos" to fetch all videos belonging to the creator.
 */

// Route: Get Channel Stats
router.route("/stats").get(getChannelStats);

// Route: Get Channel Videos
router.route("/videos").get(getChannelVideos);

export default router;
