import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

/**
 * Task: Design the User Schema with validation, hashing hooks, and JWT methods.
 * 
 * TODO:
 * 1. Define the User Schema with:
 *    - username (string, unique, lowercase, required, trim, indexed)
 *    - email (string, unique, lowercase, required, trim)
 *    - fullName (string, required, trim)
 *    - avatar (string - Cloudinary URL, required)
 *    - coverImage (string - Cloudinary URL)
 *    - password (string, required)
 *    - refreshToken (string)
 *    - adSpendBudget (number, default 0)
 *    - currency (string, default "USD")
 *    - timestamps: true
 * 2. Define a pre-save hook to hash the password before saving, only if it is modified.
 * 3. Define schema methods:
 *    - isPasswordCorrect(password): compares input password with hashed password.
 *    - generateAccessToken(): returns a JWT signed with access token secrets/expiry.
 *    - generateRefreshToken(): returns a JWT signed with refresh token secrets/expiry.
 */

const userSchema = new Schema(
    {
        // --- HINT: Define all fields with mongoose configurations ---
        // Your fields here...
        username: {
            type: String,
            unique: true,
            lowercase: true,
            required: true,
            trim: true,
            index: true, 
        },
        email: {
            type: String,
            unique: true,
            lowercase: true,
            required: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        avatar: {
            type: String,
            required: true,
        },
        coverImage: {
            type: String,
        },
        password: {
            type: String,
            required: true,
        },
        refreshToken: {
            type: String,
        },
        adSpendBudget: {
            type: Number,
            default: 0,
        },
        currency: {
            type: String,
            default: "USD",
        }
    },
    {
        timestamps: true
    }
);

// Pre-save hook for password encryption
userSchema.pre("save", async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified("password")) return next();
    
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.isPasswordCorrect = async function(password){
    // --- HINT: Use bcrypt.compare() ---
    // Your code here...
    return bcrypt.compare(password, this.password);
};

// Generate access token method
userSchema.methods.generateAccessToken = function(){
    // --- HINT: Use jwt.sign() with id, email, username, fullName ---
    // Your code here...
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

// Generate refresh token method
userSchema.methods.generateRefreshToken = function(){
    // --- HINT: Use jwt.sign() with id only ---
    // Your code here...
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export const User = mongoose.model("User", userSchema);
