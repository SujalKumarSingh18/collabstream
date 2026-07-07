import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Task: Implement JWT verification middleware to secure API routes.
 * 
 * TODO:
 * 1. Read token from request cookies `req.cookies.accessToken` or the `Authorization` header (`req.header("Authorization")?.replace("Bearer ", "")`).
 * 2. If no token is found, throw an ApiError (401, "Unauthorized access").
 * 3. Verify the token using `jwt.verify()` and your `process.env.ACCESS_TOKEN_SECRET`.
 * 4. Find the user in the database using the decoded token's `_id` claim.
 *    - Project out the password and refresh token fields for security.
 * 5. If the user doesn't exist, throw an ApiError (401, "Invalid Access Token").
 * 6. Set the user object on the request (`req.user = user`).
 * 7. Call `next()` to proceed to the controller.
 */
export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        // Retrieve token from cookies or authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized access");
        }

        // Verify token authenticity
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // Find user, selecting all fields except password and refresh token
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "User does not exist or has been deleted");
        }

        // Mount user object to request and proceed
        req.user = user;
        next();

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});
