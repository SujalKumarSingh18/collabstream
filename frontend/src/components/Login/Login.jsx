import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Film, Mail, Lock, ArrowRight } from "lucide-react";
import axios from "axios";

function Login() {
    const navigate = useNavigate();
    const [loginCredential, setLoginCredential] = useState(""); // Can be email or username
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!loginCredential || !password) {
            setError("All credentials are required.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Determine if input is email or username
            const payload = { password };
            if (loginCredential.includes("@")) {
                payload.email = loginCredential;
            } else {
                payload.username = loginCredential;
            }

            const res = await axios.post("/api/v1/users/login", payload);

            if (res.data.success) {
                // Save access token for header authorization fallback if third-party cookies are blocked
                localStorage.setItem("accessToken", res.data.data.accessToken);
                // Navigate to dashboard layout
                navigate("/");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid credentials. Try again.");
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
                    <h1 className="text-2xl font-black text-white m-0 tracking-tight">Welcome Creator</h1>
                    <p className="text-sm text-gray-400">Log in to enter your production studio</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-xl text-xs text-red-400 font-bold text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Username or Email */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                            Username or Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                required
                                placeholder="john@example.com or johndoe"
                                value={loginCredential}
                                onChange={(e) => setLoginCredential(e.target.value)}
                                className="w-full bg-[#1c1924] border border-[#2c2838] pl-10 pr-4 py-2.5 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-indigo-500"
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

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                        {loading ? "Logging in..." : "Enter Studio"}
                        {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>
                </form>

                {/* Redirect link */}
                <div className="text-center text-xs text-gray-400">
                    New to CollabStream?{" "}
                    <Link to="/register" className="text-indigo-400 font-bold hover:underline">
                        Create Account
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
