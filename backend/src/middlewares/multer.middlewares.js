import multer from "multer";

/**
 * Task: Configure Multer disk storage for local temp files.
 * 
 * TODO:
 * 1. Define storage using `multer.diskStorage()`.
 * 2. Set the destination function to save files temporarily in `./public/temp`.
 * 3. Set the filename function to save the file with its original name (`file.originalname`).
 * 4. Export the configured `upload` middleware.
 */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // --- HINT: cb(null, "./public/temp") ---
        // Your code here...
        cb(null, './public/temp');
    },
    filename: function (req, file, cb) {
        // --- HINT: cb(null, file.originalname) ---
        // Your code here...
        cb(null, file.originalname);
    }
});

export const upload = multer({ storage });
