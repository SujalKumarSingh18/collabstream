import dotenv from "dotenv";
import { app } from "./src/app.js";
import connectDB from "./src/database/index.js";

// Load environment variables
dotenv.config();

let isConnected = false;

// Serverless function request handler
const startServerless = async (req, res) => {
    try {
        if (!isConnected) {
            // Establish/reuse database connection
            await connectDB();
            isConnected = true;
        }
        // Hand over request execution to Express app
        return app(req, res);
    } catch (error) {
        console.error("Serverless invocation database connection failed:", error);
        res.status(500).json({
            success: false,
            message: "Internal server startup error",
            error: error.message
        });
    }
};

export default startServerless;
