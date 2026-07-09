import multer from "multer";
import os from "os";

/**
 * Task: Configure Multer storage to save temporary uploads.
 * Security & Serverless: Uses os.tmpdir() instead of a hardcoded local path
 * to support writeable directories in serverless environments (like Vercel /tmp).
 */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Use system temp directory (works locally on Windows/macOS and in production Vercel /tmp)
        cb(null, os.tmpdir());
    },
    filename: function (req, file, cb) {
        // Prepend timestamp to prevent name collisions
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

export const upload = multer({ storage });
