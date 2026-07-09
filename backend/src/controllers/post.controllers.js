import mongoose from "mongoose";
import { Post } from "../models/post.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Task: Create a text community post.
 */
const createPost = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content?.trim()) {
        throw new ApiError(400, "Post content cannot be empty");
    }

    const post = await Post.create({
        content,
        owner: req.user._id
    });

    const populatedPost = await Post.findById(post._id).populate("owner", "username fullName avatar");

    return res
        .status(201)
        .json(new ApiResponse(201, populatedPost, "Post created successfully"));
});

/**
 * Task: Get all posts created by a specific user.
 */
const getUserPosts = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid User ID");
    }

    const posts = await Post.find({ owner: userId }).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, posts, "User posts retrieved successfully"));
});

/**
 * Task: Update a post.
 */
const updatePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
        throw new ApiError(400, "Post content cannot be empty");
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid Post ID");
    }

    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    // Security: Only the post owner can update it
    if (post.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to update this post");
    }

    const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $set: { content } },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPost, "Post updated successfully"));
});

/**
 * Task: Delete a post.
 */
const deletePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid Post ID");
    }

    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    // Security: Only the post owner can delete it
    if (post.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this post");
    }

    await Post.findByIdAndDelete(postId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Post deleted successfully"));
});

/**
 * Task: Get all posts created by all users (Global Feed).
 */
const getAllPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find({})
        .populate("owner", "username fullName avatar")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, posts, "All community posts retrieved successfully"));
});

export {
    createPost,
    getUserPosts,
    updatePost,
    deletePost,
    getAllPosts
};
