import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Heart, UserPlus, UserCheck, MessageSquare, Trash2, Calendar, Eye } from "lucide-react";

function VideoPlayer() {
    const { videoId } = useParams();
    const [video, setVideo] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscribersCount, setSubscribersCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            // Get video details (views will auto-increment by 1 in backend)
            const videoRes = await axios.get(`/api/v1/videos/${videoId}`);
            if (videoRes.data.success) {
                const videoData = videoRes.data.data;
                setVideo(videoData);

                // Fetch comments
                const commentsRes = await axios.get(`/api/v1/comments/${videoId}`);
                if (commentsRes.data.success) {
                    setComments(commentsRes.data.data.docs || commentsRes.data.data);
                }

                // Check subscriber list of the channel owner
                const subRes = await axios.get(`/api/v1/subscriptions/c/${videoData.owner._id}`);
                if (subRes.data.success) {
                    const subList = subRes.data.data;
                    setSubscribersCount(subList.length);
                    
                    // Check if current user is inside this subscriber list
                    // Since we don't have user session details locally in React state, we can query '/u' (channels we subscribed to) and match
                    const channelsRes = await axios.get("/api/v1/subscriptions/u");
                    if (channelsRes.data.success) {
                        const isSub = channelsRes.data.data.some(ch => ch._id === videoData.owner._id);
                        setIsSubscribed(isSub);
                    }
                }

                // Check if user liked the video (query liked videos list)
                const likedRes = await axios.get("/api/v1/likes/videos");
                if (likedRes.data.success) {
                    const hasLiked = likedRes.data.data.some(v => v._id === videoId);
                    setIsLiked(hasLiked);
                }
            }
        } catch (error) {
            console.error("Error fetching video detail data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [videoId]);

    // Handle like toggle
    const handleLikeToggle = async () => {
        try {
            const res = await axios.post(`/api/v1/likes/toggle/v/${videoId}`);
            if (res.data.success) {
                setIsLiked(res.data.data.isLiked);
                setLikesCount(prev => res.data.data.isLiked ? prev + 1 : Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    // Handle subscription toggle
    const handleSubToggle = async () => {
        try {
            const res = await axios.post(`/api/v1/subscriptions/c/${video.owner._id}`);
            if (res.data.success) {
                setIsSubscribed(res.data.data.isSubscribed);
                setSubscribersCount(prev => res.data.data.isSubscribed ? prev + 1 : Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Error toggling subscription:", error);
        }
    };

    // Handle posting a comment
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const res = await axios.post(`/api/v1/comments/${videoId}`, {
                content: newComment
            });

            if (res.data.success) {
                // Prepend new comment with mock owner details to avoid re-fetch latency
                const addedComment = {
                    ...res.data.data,
                    owner: {
                        username: "You",
                        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"
                    }
                };
                setComments(prev => [addedComment, ...prev]);
                setNewComment("");
            }
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    // Handle deleting a comment
    const handleDeleteComment = async (commentId) => {
        // Optimistic update
        setComments(prev => prev.filter(c => c._id !== commentId));
        try {
            await axios.delete(`/api/v1/comments/c/${commentId}`);
        } catch (error) {
            console.error("Error deleting comment:", error);
            fetchData(); // Rollback
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!video) {
        return (
            <div className="bg-[#14121a] border border-[#201d2a] p-12 rounded-2xl text-center max-w-xl mx-auto">
                <h3 className="text-lg font-bold text-white m-0">Video Not Found</h3>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Player & Details Left */}
            <div className="lg:col-span-2 space-y-6">
                {/* HTML5 video player */}
                <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-[#201d2a] shadow-lg relative">
                    <video
                        src={video.videoFile}
                        controls
                        className="w-full h-full object-contain"
                        poster={video.thumbnail}
                    />
                </div>

                {/* Video metadata description block */}
                <div className="bg-[#14121a] border border-[#201d2a] p-6 rounded-2xl space-y-4">
                    <div className="flex justify-between items-start">
                        <h1 className="text-xl font-black text-white m-0 tracking-tight leading-snug">
                            {video.title}
                        </h1>
                        {/* Like Toggle */}
                        <button
                            onClick={handleLikeToggle}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-150 cursor-pointer ${
                                isLiked
                                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                                    : "bg-[#1c1924] border-[#2c2838] text-gray-400 hover:text-gray-200"
                            }`}
                        >
                            <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-400" : ""}`} />
                            <span>Like</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 font-semibold">
                        <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4 text-gray-400" />
                            {video.views} views
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(video.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    <p className="text-sm text-gray-300 leading-relaxed m-0 border-t border-[#201d2a] pt-4">
                        {video.description}
                    </p>
                </div>

                {/* Channel owner bar */}
                <div className="flex items-center justify-between bg-[#14121a] border border-[#201d2a] p-4 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <img
                            src={video.owner.avatar}
                            alt={video.owner.username}
                            className="w-10 h-10 rounded-full object-cover bg-zinc-900 border border-[#2c2838]"
                        />
                        <div>
                            <span className="block text-sm font-bold text-white leading-tight">
                                {video.owner.fullName}
                            </span>
                            <span className="text-[10px] text-gray-500 font-bold">
                                @{video.owner.username} • {subscribersCount} subscribers
                            </span>
                        </div>
                    </div>

                    {/* Subscription Toggle */}
                    <button
                        onClick={handleSubToggle}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                            isSubscribed
                                ? "bg-[#1c1924] border border-[#2c2838] text-indigo-400"
                                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg"
                        }`}
                    >
                        {isSubscribed ? (
                            <>
                                <UserCheck className="w-4 h-4" />
                                Subscribed
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4" />
                                Subscribe
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Comments column right */}
            <div className="bg-[#14121a] border border-[#201d2a] p-6 rounded-2xl flex flex-col h-[600px]">
                <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2 m-0 mb-4 shrink-0">
                    <MessageSquare className="w-5 h-5 text-indigo-400" />
                    Comments ({comments.length})
                </h2>

                {/* Add comment form */}
                <form onSubmit={handleAddComment} className="flex gap-2 mb-6 shrink-0">
                    <input
                        type="text"
                        placeholder="Add public comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1 bg-[#1c1924] border border-[#2c2838] px-4 py-2.5 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                    >
                        Post
                    </button>
                </form>

                {/* Comments list deck */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                    {comments.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 text-xs font-semibold">
                            No comments yet. Write the first feedback!
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div
                                key={comment._id}
                                className="bg-[#1c1924]/60 border border-[#2c2838]/40 p-3.5 rounded-xl flex gap-3 items-start group"
                            >
                                <img
                                    src={comment.owner.avatar}
                                    alt={comment.owner.username}
                                    className="w-8 h-8 rounded-full object-cover bg-zinc-900 shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-white truncate max-w-[100px]">
                                            {comment.owner.username}
                                        </span>
                                        {/* Delete comment if owner */}
                                        {(comment.owner.username === "You" || comment.owner._id === video.owner._id) && (
                                            <button
                                                onClick={() => handleDeleteComment(comment._id)}
                                                className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 leading-relaxed m-0 break-words">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default VideoPlayer;
