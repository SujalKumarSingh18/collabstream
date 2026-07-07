import mongoose, { Schema } from "mongoose";

/**
 * Task: Design the Kanban Task Schema for managing content pipeline cards.
 * 
 * TODO:
 * 1. Define the Task Schema with:
 *    - title (string, required, trim)
 *    - description (string, trim)
 *    - status (string, enum: ["TODO", "IN_PROGRESS", "REVIEW", "DONE"], default: "TODO")
 *    - priority (string, enum: ["LOW", "MEDIUM", "HIGH"], default: "MEDIUM")
 *    - assignedTo (ObjectId referencing "User")
 *    - videoRef (ObjectId referencing "Video", optional link to associated video item)
 *    - deadline (Date)
 *    - timestamps: true
 */

const taskSchema = new Schema(
    {
        // --- HINT: Set up title, description, status, priority, references, and deadline ---
        // Your fields here...
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ["TODO", "IN_PROGRESS", "REVIEW", "DONE"],
            default: "TODO",
        },
        priority: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH"],
            default: "MEDIUM",
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        videoRef: {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
        deadline: {
            type: Date,
        },
    },
    {
        timestamps: true
    }
);

export const Task = mongoose.model("Task", taskSchema);
