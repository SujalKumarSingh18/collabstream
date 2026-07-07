import { Router } from "express";
import {
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    getAllVideos
} from "../controllers/video.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Secure all video routes
router.use(verifyJWT);

/**
 * Task: Define routes for Video uploads and metadata management.
 * 
 * TODO:
 * 1. Define GET "/" to retrieve all videos (paginated, filtered).
 * 2. Define POST "/" to publish a video:
 *    - Use Multer upload fields to accept:
 *      - `videoFile` (max 1 file)
 *      - `thumbnail` (max 1 file)
 * 3. Define GET "/:videoId" to fetch a single video.
 * 4. Define PATCH "/:videoId" to update video info (accepts a single new `thumbnail` upload).
 * 5. Define DELETE "/:videoId" to remove a video.
 */

// Route: Get all videos / Publish video
router.route("/").get(getAllVideos).post(
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    publishAVideo
);

// Route: Get, update, delete single video
router.route("/:videoId")
    .get(getVideoById)
    .patch(upload.single("thumbnail"), updateVideo)
    .delete(deleteVideo);

export default router;
