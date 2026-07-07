import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
    {
        subscriber: {
            type: Schema.Types.ObjectId, // The user who is subscribing
            ref: "User",
            required: true,
        },
        channel: {
            type: Schema.Types.ObjectId, // The user channel being subscribed to
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Add unique compound index to prevent duplicate subscriptions
subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
