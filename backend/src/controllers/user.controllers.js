import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

/**
 * Helper: Generate access and refresh tokens for a user, update refresh token on User document.
 */
const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

/**
 * Task: Register a new User.
 * 
 * TODO:
 * 1. Extract registration fields from req.body (fullName, email, username, password).
 * 2. Validate all fields are non-empty.
 * 3. Check if the user already exists in DB (by email or username).
 * 4. Extract local file paths for uploaded avatar (and optional coverImage) from `req.files`.
 * 5. Upload avatar (and coverImage) to Cloudinary.
 * 6. Save the user record in database with the hashed password and Cloudinary URLs.
 * 7. Remove sensitive fields (password, refreshToken) from response payload.
 * 8. Return 201 response.
 */
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    // Validate that all required text fields are provided and not empty spaces
    if (![fullName, email, username, password].every(field => field?.trim())) {
        throw new ApiError(400, "All fields (fullName, email, username, password) are required");
    }

    // Check if the user already exists in the database (matching either email OR username)
    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existingUser) {
        throw new ApiError(409, "User with this email or username already exists");
    }

    // Extract local file paths parsed by Multer middleware
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image file is required");
    }

    // Upload files to Cloudinary
    const avatarUpload = await uploadOnCloudinary(avatarLocalPath);
    if (!avatarUpload) {
        throw new ApiError(500, "Failed to upload avatar to Cloudinary");
    }

    let coverImageUpload = null;
    if (coverImageLocalPath) {
        coverImageUpload = await uploadOnCloudinary(coverImageLocalPath);
        if (!coverImageUpload) {
            throw new ApiError(500, "Failed to upload cover image to Cloudinary");
        }
    }

    // Create user document in MongoDB
    const user = await User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        password, // Hashed automatically by our pre-save hook in user.models.js
        avatar: avatarUpload.url,
        coverImage: coverImageUpload?.url || ""
    });

    // Retrieve the created user without the password and refreshToken fields
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

/**
 * Task: Login user, generate tokens, and set secure HTTP-only cookies.
 */
const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    // Users login using password and EITHER email OR username
    if (!(email || username) || !password) {
        throw new ApiError(400, "Username or Email and password are required");
    }

    // Find the user matching either the provided username or email
    const user = await User.findOne({
        $or: [
            { email: email || "" },
            { username: username || "" }
        ]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    // Verify if plain text password matches the hashed password in MongoDB
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid user credentials");
    }

    // Generate JWT access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

    // Options for secure HTTP-only cookies (protects against XSS attacks)
    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    };

    // Remove sensitive fields before returning user details
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200, 
                { user: loggedInUser, accessToken, refreshToken }, 
                "User logged in successfully"
            )
        );
});

/**
 * Task: Log out the user and clear cookies.
 */
const logoutUser = asyncHandler(async (req, res) => {
    // Clear the user's refresh token in the database
    // req.user is loaded by the verifyJWT middleware
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // Removes the field from the MongoDB document
            }
        },
        { new: true }
    );

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    };

    // Clear access and refresh token cookies from the browser
    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

/**
 * Task: Refresh expired Access Token using a valid Refresh Token.
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is missing");
    }

    try {
        // Decode and verify the incoming refresh token signature
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        // Verify that the token matches the active refresh token stored in DB
        if (user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Refresh token is expired or already used");
        }

        // Generate a new pair of tokens
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefereshTokens(user._id);

        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", newRefreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed successfully"
                )
            );

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

/**
 * Task: Get the currently logged-in user profile details.
 */
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser
};
