import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

/**
 * Task: Create central error handling middleware to catch and format API exceptions.
 * 
 * TODO:
 * 1. Define standard middleware with 4 arguments: (err, req, res, next).
 * 2. Check if the incoming `err` is an instance of `ApiError`.
 * 3. If it is NOT:
 *    - Determine appropriate status code: check if there's an existing `err.statusCode`, or if it's a Mongoose validation error (assign 400), otherwise default to 500.
 *    - Wrap the error inside a new `ApiError` instance.
 * 4. Format a consistent JSON error response containing success (false), message, and errors array.
 * 5. Send the JSON response with the corresponding HTTP status code.
 */
const errorHandler = (err, req, res, next) => {
    // --- HINT: Standardize error to ApiError, format JSON output, send response ---
    // Your code here...
    let error = err;
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || (error instanceof mongoose.Error ? 400 : 500);
        const message = error.message || "Something went wrong";
        error = new ApiError(statusCode, message, error?.errors || [], err.stack);
    }
    const response = {
        success: error.success,
        statusCode: error.statusCode,
        message: error.message,
        errors: error.errors,
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {})
    };
    return res.status(error.statusCode).json(response);
};

export { errorHandler };
