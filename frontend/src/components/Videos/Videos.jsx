import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Play, Plus, Film, Eye, Clock, User, X } from "lucide-react";

function Videos() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const fetchVideos = async () => {
        try {
            const res = await axios.get("/api/v1/videos");
            if (res.data.success) {
                // If nested in paginated structure, get from docs
                const data = res.data.data.docs || res.data.data;
                setVideos(data);
            }
        } catch (err) {
            console.error("Error fetching videos:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!title.trim() || !description.trim() || !videoFile || !thumbnail) {
            setError("All fields (title, description, video, thumbnail) are required.");
            return;
        }

        setUploading(true);
        setError("");

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("videoFile", videoFile);
        formData.append("thumbnail", thumbnail);

        try {
            const res = await axios.post("/api/v1/videos", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data.success) {
                // Close modal and refresh list
                setTitle("");
                setDescription("");
                setVideoFile(null);
                setThumbnail(null);
                setIsModalOpen(false);
                fetchVideos();
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to publish video. Try again.");
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header controls */}
            <div className="flex justify-between items-center">
                <p className="text-gray-400 text-sm m-0">
                    Browse published channel content or upload new videos to the pipeline.
                </p>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-lg transition-colors cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    Upload Video
                </button>
            </div>

            {/* Video Grid */}
            {videos.length === 0 ? (
                <div className="bg-[#14121a] border border-[#201d2a] p-12 rounded-2xl text-center space-y-4 max-w-xl mx-auto">
                    <div className="inline-flex p-4 bg-indigo-500/10 rounded-full text-indigo-400">
                        <Film className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-white m-0">No Videos Published</h3>
                    <p className="text-sm text-gray-400 m-0">
                        Publish your first video. Select a video file and a thumbnail to upload to Cloudinary.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.map((vid) => (
                        <Link
                            key={vid._id}
                            to={`/videos/${vid._id}`}
                            className="bg-[#14121a] border border-[#201d2a] rounded-2xl overflow-hidden hover:border-[#38334e] transition-all duration-200 group flex flex-col"
                        >
                            {/* Thumbnail container */}
                            <div className="relative aspect-video bg-zinc-950 shrink-0">
                                <img
                                    src={vid.thumbnail}
                                    alt={vid.title}
                                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                                />
                                {/* Duration badge */}
                                <span className="absolute bottom-2 right-2 bg-black/85 text-[10px] font-bold text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-indigo-400" />
                                    {Math.round(vid.duration)}s
                                </span>
                            </div>

                            {/* Details body */}
                            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                                <div>
                                    <h3 className="text-sm font-bold text-white line-clamp-2 m-0 mb-1.5 leading-snug group-hover:text-indigo-400 transition-colors">
                                        {vid.title}
                                    </h3>
                                    <p className="text-xs text-gray-400 line-clamp-2 m-0 leading-relaxed">
                                        {vid.description}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between border-t border-[#201d2a] pt-3 text-[10px] text-gray-500 font-semibold">
                                    <span className="flex items-center gap-1.5 truncate max-w-[120px]">
                                        <User className="w-3.5 h-3.5 text-indigo-400" />
                                        <span className="truncate">{vid.owner?.username || "Creator"}</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Eye className="w-3.5 h-3.5 text-gray-400" />
                                        {vid.views} views
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Upload Video Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <form
                        onSubmit={handleUpload}
                        className="bg-[#14121a] border border-[#2c2838] rounded-2xl w-full max-w-md p-6 space-y-4"
                    >
                        <div className="flex justify-between items-center border-b border-[#2c2838] pb-3">
                            <h2 className="text-lg font-black text-white m-0 tracking-tight flex items-center gap-2">
                                <Film className="w-5 h-5 text-indigo-400" />
                                Upload Video File
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-white cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-xs text-red-400 font-bold text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                                    Video Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter video title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-[#1c1924] border border-[#2c2838] px-4 py-2.5 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    required
                                    placeholder="Enter video description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-[#1c1924] border border-[#2c2838] px-4 py-2.5 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-indigo-500 min-h-[80px]"
                                />
                            </div>

                            {/* File Upload inputs */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                                        Video File *
                                    </label>
                                    <label className="flex flex-col items-center justify-center border border-dashed border-[#2c2838] bg-[#1c1924] py-3 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors">
                                        <Play className="w-5 h-5 text-indigo-400 mb-1" />
                                        <span className="text-[10px] font-bold text-gray-400 truncate max-w-[120px] px-2">
                                            {videoFile ? videoFile.name : "Select Video"}
                                        </span>
                                        <input
                                            type="file"
                                            accept="video/*"
                                            required
                                            onChange={(e) => setVideoFile(e.target.files[0])}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                                        Thumbnail Image *
                                    </label>
                                    <label className="flex flex-col items-center justify-center border border-dashed border-[#2c2838] bg-[#1c1924] py-3 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors">
                                        <Film className="w-5 h-5 text-gray-500 mb-1" />
                                        <span className="text-[10px] font-bold text-gray-400 truncate max-w-[120px] px-2">
                                            {thumbnail ? thumbnail.name : "Select Image"}
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            required
                                            onChange={(e) => setThumbnail(e.target.files[0])}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-[#2c2838]">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-gray-200 cursor-pointer"
                                disabled={uploading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer disabled:opacity-50"
                                disabled={uploading}
                            >
                                {uploading ? "Uploading to Cloudinary..." : "Publish Video"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Videos;
