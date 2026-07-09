import React, { useState, useEffect } from "react";
import axios from "axios";
import { Send, MessageSquare, Trash2, Heart } from "lucide-react";

function Community() {
    const [posts, setPosts] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [newPostContent, setNewPostContent] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchProfileAndPosts = async () => {
        try {
            // Get currently logged-in user profile
            const profileRes = await axios.get("/api/v1/users/current-user");
            if (profileRes.data.success) {
                const user = profileRes.data.data;
                setCurrentUser(user);

                // Fetch global feed of posts from all creators
                const postsRes = await axios.get("/api/v1/posts");
                if (postsRes.data.success) {
                    setPosts(postsRes.data.data);
                }
            }
        } catch (error) {
            console.error("Error fetching community profile or posts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileAndPosts();
    }, []);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;

        try {
            const res = await axios.post("/api/v1/posts", {
                content: newPostContent
            });

            if (res.data.success) {
                // Prepend new post
                setPosts(prev => [res.data.data, ...prev]);
                setNewPostContent("");
            }
        } catch (error) {
            console.error("Error creating post:", error);
        }
    };

    const handleDeletePost = async (postId) => {
        // Optimistic delete
        setPosts(prev => prev.filter(post => post._id !== postId));
        try {
            await axios.delete(`/api/v1/posts/${postId}`);
        } catch (error) {
            console.error("Error deleting post:", error);
            fetchProfileAndPosts(); // Rollback
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
        <div className="max-w-3xl mx-auto space-y-6">
            <p className="text-gray-400 text-sm m-0">
                Share text updates, announcements, or messages directly with the global CollabStream community.
            </p>

            {/* Create Post Block */}
            {currentUser && (
                <form
                    onSubmit={handleCreatePost}
                    className="bg-[#14121a] border border-[#201d2a] p-5 rounded-2xl space-y-4"
                >
                    <div className="flex gap-3">
                        <img
                            src={currentUser.avatar}
                            alt={currentUser.username}
                            className="w-10 h-10 rounded-full object-cover bg-zinc-900 border border-[#2c2838]"
                        />
                        <textarea
                            placeholder="What's on your mind? Post a community update..."
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            className="flex-1 bg-[#1c1924] border border-[#2c2838] px-4 py-3 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-indigo-500 min-h-[80px]"
                            required
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-colors cursor-pointer"
                        >
                            <Send className="w-3.5 h-3.5" />
                            Post Update
                        </button>
                    </div>
                </form>
            )}

            {/* Posts Deck */}
            <div className="space-y-4">
                {posts.length === 0 ? (
                    <div className="bg-[#14121a] border border-[#201d2a] p-12 rounded-2xl text-center text-gray-500 text-sm font-semibold">
                        No community updates published yet.
                    </div>
                ) : (
                    posts.map((post) => {
                        const author = post.owner || {};
                        const isOwnPost = currentUser?._id === author._id;

                        return (
                            <div
                                key={post._id}
                                className="bg-[#14121a] border border-[#201d2a] p-5 rounded-2xl space-y-4 hover:border-[#38334e] transition-all duration-200 group"
                            >
                                {/* Card Header info */}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={author.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"}
                                            alt={author.username || "Creator"}
                                            className="w-10 h-10 rounded-full object-cover bg-zinc-900 border border-[#2c2838]"
                                        />
                                        <div>
                                            <span className="block text-sm font-bold text-white leading-tight">
                                                {author.fullName || "Creator"}
                                            </span>
                                            <span className="text-[10px] text-gray-500 font-bold">
                                                @{author.username || "unknown"} • {new Date(post.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Delete Post option (Only visible to the post owner) */}
                                    {isOwnPost && (
                                        <button
                                            onClick={() => handleDeletePost(post._id)}
                                            className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Content */}
                                <p className="text-sm text-gray-200 leading-relaxed m-0 break-words pl-1">
                                    {post.content}
                                </p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default Community;
