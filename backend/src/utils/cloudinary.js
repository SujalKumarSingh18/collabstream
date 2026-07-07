import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Task: Upload a local file to Cloudinary and delete the local temp file afterwards.
 */
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        
        // Upload the file on Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", // Automatically determine file type (video, image, etc.)
        });
        
        // Successfully uploaded! Clean up the local temp file.
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        console.error("❌ Cloudinary Upload Error: ", error);
        
        // Ensure local temp file is removed to prevent disk space leaks
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
};

/**
 * Task: Delete an asset from Cloudinary using its publicId.
 */
const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return null;
        
        const response = await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted from Cloudinary. PublicId: ${publicId}`);
        return response;
    } catch (error) {
        console.error("❌ Cloudinary Deletion Error: ", error);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };
