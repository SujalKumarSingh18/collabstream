import { Router } from "express";
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken 
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

/**
 * Task: Register user routes.
 * 
 * TODO:
 * 1. Define a POST route for "/register" that:
 *    - Uses Multer `upload.fields` to accept an `avatar` (max 1 file) and a `coverImage` (max 1 file).
 *    - Routes to the `registerUser` controller.
 * 2. Define a POST route for "/login" that routes to `loginUser`.
 * 3. Define a POST route for "/logout" that:
 *    - First runs the `verifyJWT` middleware.
 *    - Then routes to the `logoutUser` controller.
 * 4. Define a POST route for "/refresh-token" that routes to `refreshAccessToken`.
 */

// Route: Register User
// --- HINT: Use upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]) ---
// Your route here...

// Route: Login User
// Your route here...

// Route: Logout User (Secured)
// Your route here...

// Route: Refresh Access Token
// Your route here...

export default router;
