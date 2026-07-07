import mongoose from "mongoose";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Task: Toggle subscription status on a channel.
 */
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid Channel ID");
    }

    // Prevent subscribing to yourself
    if (channelId.toString() === req.user._id.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    // Check if subscription record already exists
    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    });

    if (existingSubscription) {
        // If subscribed already, remove it (unsubscribe)
        await Subscription.findByIdAndDelete(existingSubscription._id);
        return res
            .status(200)
            .json(new ApiResponse(200, { isSubscribed: false }, "Unsubscribed successfully"));
    } else {
        // Create new subscription link
        const newSubscription = await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        });
        return res
            .status(201)
            .json(new ApiResponse(201, { isSubscribed: true, subscription: newSubscription }, "Subscribed successfully"));
    }
});

/**
 * Task: Get the subscriber list of a channel.
 */
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid Channel ID");
    }

    // Query subscribers joining User details
    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails"
            }
        },
        {
            $unwind: "$subscriberDetails"
        },
        {
            $project: {
                _id: "$subscriberDetails._id",
                fullName: "$subscriberDetails.fullName",
                username: "$subscriberDetails.username",
                avatar: "$subscriberDetails.avatar"
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, subscribers, "Subscribers list retrieved successfully"));
});

/**
 * Task: Get the list of channels the logged-in user has subscribed to.
 */
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const subscriberId = req.user._id;

    // Query subscriptions where subscriber is the current user, joining channel (User) details
    const channels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetails"
            }
        },
        {
            $unwind: "$channelDetails"
        },
        {
            $project: {
                _id: "$channelDetails._id",
                fullName: "$channelDetails.fullName",
                username: "$channelDetails.username",
                avatar: "$channelDetails.avatar"
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, channels, "Subscribed channels retrieved successfully"));
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};
