import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        // A like can be on a video, a comment, or a community post
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            default: null,
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
            default: null,
        },
        post: {
            type: Schema.Types.ObjectId,
            ref: "Post",
            default: null,
        },
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Like = mongoose.model("Like", likeSchema);
