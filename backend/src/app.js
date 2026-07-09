import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

/**
 * Task: Configure express middlewares.
 * 
 * TODO:
 * 1. Configure CORS middleware with custom origin and credentials.
 * 2. Configure JSON parser middleware with a 16kb limit.
 * 3. Configure Urlencoded parser middleware (extended: true) with a 16kb limit.
 * 4. Configure static folder middleware to serve public assets.
 * 5. Configure cookie-parser middleware.
 */

// 1. CORS Configuration - dynamically echo back the request origin to allow secure cross-origin requests
app.use(
    cors({
        origin: function (origin, callback) {
            // Echo back the requesting origin to allow any client (including localhost and Vercel deployments)
            callback(null, true);
        },
        credentials: true,
    })
);

// 2. Body & Cookie Parsing Common Middlewares
app.use(express.json({ limit: "16kb" })); // Parse JSON payloads up to 16kb
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // Parse URL-encoded values
app.use(express.static("public")); // Serve static assets from public folder
app.use(cookieParser()); // Enable parsing and signing of request cookies


// IMPORT ROUTES
import userRouter from "./routes/user.routes.js";
import taskRouter from "./routes/task.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import postRouter from "./routes/post.routes.js";
import { errorHandler } from "./middlewares/error.middlewares.js";

// ROUTES DECLARATION
// Mount under both /api/v1 and /v1 to prevent path prefix issues during serverless rewrites
app.use("/api/v1/users", userRouter);
app.use("/v1/users", userRouter);

app.use("/api/v1/tasks", taskRouter);
app.use("/v1/tasks", taskRouter);

app.use("/api/v1/dashboard", dashboardRouter);
app.use("/v1/dashboard", dashboardRouter);

app.use("/api/v1/videos", videoRouter);
app.use("/v1/videos", videoRouter);

app.use("/api/v1/comments", commentRouter);
app.use("/v1/comments", commentRouter);

app.use("/api/v1/likes", likeRouter);
app.use("/v1/likes", likeRouter);

app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/v1/subscriptions", subscriptionRouter);

app.use("/api/v1/posts", postRouter);
app.use("/v1/posts", postRouter);

// ERROR HANDLER MIDDLEWARE (Mounted last to catch exceptions from all routes)
app.use(errorHandler);

export { app };
