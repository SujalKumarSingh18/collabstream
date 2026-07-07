import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./database/index.js";

// Load environment variables
dotenv.config({
    path: "./.env"
});

/**
 * Task: Start the server after connecting to MongoDB.
 * 
 * TODO:
 * 1. Call the connectDB() function.
 * 2. In .then(): Start the Express app listening on the specified PORT (from process.env or fallback).
 * 3. Log a server start success message with the PORT.
 * 4. In .catch(): Log a MongoDB connection error.
 */

const PORT = process.env.PORT || 8000;

// Call database connection and wait for resolution
connectDB()
    .then(() => {
        // Start express listening only after DB connection succeeds
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ Express server startup failed due to DB connection error: ", err);
    });
