import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Film, User, Mail, Lock, FileImage, ArrowRight } from "lucide-react";
import axios from "axios";

function Register() {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!fullName || !email || !username || !password || !avatar) {
            setError("All text fields and an avatar image are required.");
            return;
        }

        setLoading(true);
        setError("");

        // Create multipart/form-data payload for Multer parsing
        const formData = new FormData();
        formData.append("fullName", fullName);
        formData.append("email", email);
        formData.append("username", username);
        formData.append("password", password);
        formData.append("avatar", avatar);
        if (coverImage) {
            formData.append("coverImage", coverImage);
        }

        try {
            const res = await axios.post("/api/v1/users/register", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data.success) {
                // Navigate to login on success
                navigate("/login");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0c0a0f] flex items-center justify-center p-6 text-gray-100 font-sans">
            <div className="w-full max-w-md bg-[#14121a] border border-[#201d2a] p-8 rounded-3xl space-y-6 shadow-2xl">
                {/* Logo and title */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-2">
                        <Film className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-2xl font-black text-white m-0 tracking-tight">Create Creator Account</h1>
                    <p className="text-sm text-gray-400">Set up your studio pipeline profile</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-xl text-xs text-red-400 font-bold text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                required
                                placeholder="John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-[#1c1924] border border-[#2c2838] pl-10 pr-4 py-2.5 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="email"
                                required
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#1c1924] border border-[#2c2838] pl-10 pr-4 py-2.5 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                            Username
                        </label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">@</span>
                            <input
                                type="text"
                                required
                                placeholder="johndoe"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-[#1c1924] border border-[#2c2838] pl-8 pr-4 py-2.5 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#1c1924] border border-[#2c2838] pl-10 pr-4 py-2.5 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    {/* File Inputs (Avatar & Cover Image) */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                                Avatar Image *
                            </label>
                            <label className="flex flex-col items-center justify-center border border-dashed border-[#2c2838] bg-[#1c1924] py-3 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors">
                                <FileImage className="w-5 h-5 text-indigo-400 mb-1" />
                                <span className="text-[10px] font-bold text-gray-400 truncate max-w-[120px] px-2">
                                    {avatar ? avatar.name : "Choose File"}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    required
                                    onChange={(e) => setAvatar(e.target.files[0])}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                                Cover Image (Opt)
                            </label>
                            <label className="flex flex-col items-center justify-center border border-dashed border-[#2c2838] bg-[#1c1924] py-3 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors">
                                <FileImage className="w-5 h-5 text-gray-500 mb-1" />
                                <span className="text-[10px] font-bold text-gray-400 truncate max-w-[120px] px-2">
                                    {coverImage ? coverImage.name : "Choose File"}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setCoverImage(e.target.files[0])}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? "Creating Account..." : "Register Creator"}
                        {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>
                </form>

                {/* Redirect link */}
                <div className="text-center text-xs text-gray-400">
                    Already have an account?{" "}
                    <Link to="/login" className="text-indigo-400 font-bold hover:underline">
                        Log In
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Register;
