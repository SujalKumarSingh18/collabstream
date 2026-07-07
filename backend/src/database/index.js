import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

/**
 * Task: Connect to MongoDB using mongoose.
 * 
 * TODO:
 * 1. Implement connection using mongoose.connect().
 * 2. Retrieve the MONGODB_URI environment variable and append the DB_NAME.
 * 3. Log a success message containing the host of the connection.
 * 4. Handle errors appropriately: catch any errors, log a connection error message, and terminate the process with code 1.
 */
const connectDB = async () => {
    try {
        // Retrieve database URI and database name, and establish connection
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_URI}/${DB_NAME}`
        );
        
        // Log host details to verify connection environment (dev, production, etc.)
        console.log(`\n✅ MongoDB Connected! DB HOST: ${connectionInstance.connection.host}\n`);
    }
    catch (error) {
        console.error("❌ MongoDB Connection Failure: ", error);
        // Exit process with failure code (1) to prevent starting a server without a DB
        process.exit(1);
    }   
};

export default connectDB;
