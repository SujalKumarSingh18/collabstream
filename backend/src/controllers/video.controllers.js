import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

/**
 * Task: Publish a new video to the creator's channel.
 */
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title?.trim() || !description?.trim()) {
        throw new ApiError(400, "Title and description are required");
    }

    // Extract local file paths parsed by Multer
    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required");
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail image is required");
    }

    // Upload to Cloudinary (resource_type: auto is handled inside our utility)
    const videoUpload = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoUpload) {
        throw new ApiError(500, "Failed to upload video to Cloudinary");
    }
    if (!thumbnailUpload) {
        throw new ApiError(500, "Failed to upload thumbnail to Cloudinary");
    }

    // Create Video record in MongoDB
    // duration is retrieved from Cloudinary's response metadata
    const video = await Video.create({
        videoFile: videoUpload.url,
        thumbnail: thumbnailUpload.url,
        title,
        description,
        duration: videoUpload.duration || 0,
        owner: req.user._id,
        isPublished: true
    });

    return res
        .status(201)
        .json(new ApiResponse(201, video, "Video published successfully"));
});

/**
 * Task: Get a video by its ID and increment views.
 */
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    // Find and increment views by 1
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $inc: { views: 1 }
        },
        { new: true }
    ).populate("owner", "fullName username avatar");

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video retrieved and views incremented"));
});

/**
 * Task: Update video metadata (title, description, thumbnail).
 */
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    const thumbnailLocalPath = req.file?.path;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Authorization check: Only the video owner can update
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to update this video");
    }

    let thumbnailUpload = null;
    if (thumbnailLocalPath) {
        thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);
        if (!thumbnailUpload) {
            throw new ApiError(500, "Failed to upload new thumbnail");
        }
    }

    // Build update fields safely
    const updateData = {
        title: title || video.title,
        description: description || video.description
    };

    if (thumbnailUpload) {
        updateData.thumbnail = thumbnailUpload.url;
        
        // Extract public ID of old thumbnail from URL to delete it from Cloudinary
        // E.g., http://res.cloudinary.com/demo/image/upload/v1234/old_id.jpg -> old_id
        const oldThumbnailPublicId = video.thumbnail.split("/").pop().split(".")[0];
        await deleteFromCloudinary(oldThumbnailPublicId);
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: updateData },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video metadata updated successfully"));
});

/**
 * Task: Delete a video from DB and Cloudinary.
 */
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Authorization check
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this video");
    }

    // Extract Cloudinary public IDs to delete assets
    const videoFilePublicId = video.videoFile.split("/").pop().split(".")[0];
    const thumbnailPublicId = video.thumbnail.split("/").pop().split(".")[0];

    // Delete assets from Cloudinary (both video and thumbnail image)
    await deleteFromCloudinary(videoFilePublicId);
    await deleteFromCloudinary(thumbnailPublicId);

    // Delete document from MongoDB
    await Video.findByIdAndDelete(videoId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

/**
 * Task: Query all videos (search, sorting, and pagination).
 */
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;

    const pipeline = [];

    // Filter by keyword search if provided (matching title or description)
    if (query) {
        pipeline.push({
            $match: {
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } }
                ]
            }
        });
    }

    // Filter by specific channel owner ID if provided
    if (userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ApiError(400, "Invalid user ID filter");
        }
        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        });
    }

    // Only fetch published videos
    pipeline.push({
        $match: { isPublished: true }
    });

    // Handle sorting
    const sortStage = {};
    sortStage[sortBy] = sortType === "asc" ? 1 : -1;
    pipeline.push({
        $sort: sortStage
    });

    // Populate owner fields inside aggregation
    pipeline.push({
        $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "ownerDetails"
        }
    });

    pipeline.push({
        $unwind: "$ownerDetails"
    });

    // Project clean details
    pipeline.push({
        $project: {
            videoFile: 1,
            thumbnail: 1,
            title: 1,
            description: 1,
            duration: 1,
            views: 1,
            createdAt: 1,
            owner: {
                _id: "$ownerDetails._id",
                fullName: "$ownerDetails.fullName",
                username: "$ownerDetails.username",
                avatar: "$ownerDetails.avatar"
            }
        }
    });

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const paginatedVideos = await Video.aggregatePaginate(Video.aggregate(pipeline), options);

    return res
        .status(200)
        .json(new ApiResponse(200, paginatedVideos, "Videos fetched successfully"));
});

export {
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    getAllVideos
};
