import mongoose from "mongoose";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Task: Toggle like on a video.
 */
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    // Check if the user has already liked this video
    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    });

    if (existingLike) {
        // If liked already, delete the like (unlike)
        await Like.findByIdAndDelete(existingLike._id);
        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false }, "Unliked video successfully"));
    } else {
        // Otherwise, create a new like record
        const newLike = await Like.create({
            video: videoId,
            likedBy: req.user._id
        });
        return res
            .status(201)
            .json(new ApiResponse(201, { isLiked: true, like: newLike }, "Liked video successfully"));
    }
});

/**
 * Task: Toggle like on a comment.
 */
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid Comment ID");
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false }, "Unliked comment successfully"));
    } else {
        const newLike = await Like.create({
            comment: commentId,
            likedBy: req.user._id
        });
        return res
            .status(201)
            .json(new ApiResponse(201, { isLiked: true, like: newLike }, "Liked comment successfully"));
    }
});

/**
 * Task: Toggle like on a post.
 */
const togglePostLike = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid Post ID");
    }

    const existingLike = await Like.findOne({
        post: postId,
        likedBy: req.user._id
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false }, "Unliked post successfully"));
    } else {
        const newLike = await Like.create({
            post: postId,
            likedBy: req.user._id
        });
        return res
            .status(201)
            .json(new ApiResponse(201, { isLiked: true, like: newLike }, "Liked post successfully"));
    }
});

/**
 * Task: Retrieve list of all videos liked by this user.
 */
const getLikedVideos = asyncHandler(async (req, res) => {
    // Run aggregation to fetch liked videos and populate details
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video: { $exists: true, $ne: null }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },
        {
            $unwind: "$videoDetails"
        },
        {
            $lookup: {
                from: "users",
                localField: "videoDetails.owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        {
            $unwind: "$ownerDetails"
        },
        {
            $project: {
                _id: "$videoDetails._id",
                videoFile: "$videoDetails.videoFile",
                thumbnail: "$videoDetails.thumbnail",
                title: "$videoDetails.title",
                description: "$videoDetails.description",
                views: "$videoDetails.views",
                duration: "$videoDetails.duration",
                createdAt: "$videoDetails.createdAt",
                owner: {
                    _id: "$ownerDetails._id",
                    fullName: "$ownerDetails.fullName",
                    username: "$ownerDetails.username",
                    avatar: "$ownerDetails.avatar"
                }
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Liked videos retrieved successfully"));
});

export {
    toggleCommentLike,
    togglePostLike,
    toggleVideoLike,
    getLikedVideos
};
