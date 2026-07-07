import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

/**
 * Task: Design the Video Schema with pagination support.
 * 
 * TODO:
 * 1. Define the Video Schema with:
 *    - videoFile (string - Cloudinary URL, required)
 *    - thumbnail (string - Cloudinary URL, required)
 *    - title (string, required)
 *    - description (string, required)
 *    - duration (number, required - retrieved from Cloudinary)
 *    - views (number, default: 0)
 *    - isPublished (boolean, default: true)
 *    - owner (ObjectId referencing "User")
 *    - timestamps: true
 * 2. Attach the mongoose-aggregate-paginate-v2 plugin to the schema.
 */

const videoSchema = new Schema(
    {
        videoFile: {
            type: String, // Cloudinary URL
            required: true,
        },
        thumbnail: {
            type: String, // Cloudinary URL
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        duration: {
            type: Number, // Duration from Cloudinary upload metadata
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

// Apply the aggregate pagination plugin for advanced paginated pipeline aggregation queries
videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
