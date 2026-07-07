import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";
import { Task } from "../models/task.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Task: Fetch channel statistical overview for the dashboard.
 */
const getChannelStats = asyncHandler(async (req, res) => {
    const creatorId = new mongoose.Types.ObjectId(req.user._id);

    // 1. Count total videos uploaded by this creator
    const totalVideos = await Video.countDocuments({ owner: creatorId });

    // 2. Sum up total views from all videos uploaded by this creator using aggregation
    const viewAggregation = await Video.aggregate([
        { $match: { owner: creatorId } },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" }
            }
        }
    ]);
    const totalViews = viewAggregation[0]?.totalViews || 0;

    // 3. Count total subscribers of this creator's channel
    const totalSubscribers = await Subscription.countDocuments({ channel: creatorId });

    // 4. Aggregate total likes across all videos uploaded by this creator
    const likesAggregation = await Video.aggregate([
        { $match: { owner: creatorId } },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "videoLikes"
            }
        },
        {
            $project: {
                likesCount: { $size: "$videoLikes" }
            }
        },
        {
            $group: {
                _id: null,
                totalLikes: { $sum: "$likesCount" }
            }
        }
    ]);
    const totalLikes = likesAggregation[0]?.totalLikes || 0;

    // 5. Count task completions status breakdown (Kanban progress stats)
    const taskAggregation = await Task.aggregate([
        { $match: { assignedTo: creatorId } },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);

    // Build structured counts matching all Kanban columns
    const kanbanStats = { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 };
    taskAggregation.forEach(item => {
        if (kanbanStats[item._id] !== undefined) {
            kanbanStats[item._id] = item.count;
        }
    });

    // Compile into dashboard payload
    const statsData = {
        totalVideos,
        totalViews,
        totalSubscribers,
        totalLikes,
        kanbanStats
    };

    return res
        .status(200)
        .json(new ApiResponse(200, statsData, "Channel stats retrieved successfully"));
});

/**
 * Task: Retrieve list of all videos uploaded by the channel owner.
 */
const getChannelVideos = asyncHandler(async (req, res) => {
    const creatorId = req.user._id;

    // Fetch videos and sort by latest upload
    const videos = await Video.find({ owner: creatorId }).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Channel videos retrieved successfully"));
});

export {
    getChannelStats,
    getChannelVideos
};
