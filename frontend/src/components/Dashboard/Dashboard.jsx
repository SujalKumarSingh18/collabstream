import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, Eye, Play, Heart, ClipboardList } from "lucide-react";

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch stats and videos concurrently
                const [statsRes, videosRes] = await Promise.all([
                    axios.get("/api/v1/dashboard/stats"),
                    axios.get("/api/v1/dashboard/videos")
                ]);

                if (statsRes.data.success) setStats(statsRes.data.data);
                if (videosRes.data.success) setVideos(videosRes.data.data);
            } catch (error) {
                console.error("Error fetching dashboard statistics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Default fallbacks if database is empty
    const statsData = stats || {
        totalVideos: 0,
        totalViews: 0,
        totalSubscribers: 0,
        totalLikes: 0,
        kanbanStats: { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 }
    };

    const cards = [
        { title: "Total Subscribers", value: statsData.totalSubscribers, icon: Users, color: "text-blue-400", bg: "from-blue-500/10 to-transparent" },
        { title: "Video Views", value: statsData.totalViews, icon: Eye, color: "text-emerald-400", bg: "from-emerald-500/10 to-transparent" },
        { title: "Videos Uploaded", value: statsData.totalVideos, icon: Play, color: "text-indigo-400", bg: "from-indigo-500/10 to-transparent" },
        { title: "Likes Earned", value: statsData.totalLikes, icon: Heart, color: "text-rose-400", bg: "from-rose-500/10 to-transparent" }
    ];

    return (
        <div className="space-y-8">
            {/* Grid of stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={idx}
                            className={`p-6 rounded-2xl bg-[#14121a] border border-[#201d2a] bg-gradient-to-br ${card.bg} hover:border-[#38334e] transition-all duration-300 group`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-semibold text-gray-400 group-hover:text-gray-300">
                                    {card.title}
                                </span>
                                <Icon className={`w-5 h-5 ${card.color}`} />
                            </div>
                            <span className="text-3xl font-black text-white tracking-tight">
                                {card.value.toLocaleString()}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Kanban Production Progress Summary & Videos Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Videos upload list */}
                <div className="lg:col-span-2 bg-[#14121a] border border-[#201d2a] p-6 rounded-2xl space-y-6">
                    <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2 m-0">
                        Recent Content Uploads
                    </h2>

                    {videos.length === 0 ? (
                        <div className="bg-[#1c1924] border border-dashed border-[#2c2838] p-8 rounded-xl text-center text-gray-500 text-sm">
                            No videos published yet. Create videos using the endpoint to see them here!
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {videos.map((vid) => (
                                <div
                                    key={vid._id}
                                    className="flex items-center gap-4 bg-[#1c1924] p-4 rounded-xl border border-[#2c2838] hover:border-[#3c374d] transition-all duration-150"
                                >
                                    <img
                                        src={vid.thumbnail}
                                        alt={vid.title}
                                        className="w-24 h-14 object-cover rounded-lg bg-zinc-950 shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-bold text-white truncate m-0 mb-1">
                                            {vid.title}
                                        </h3>
                                        <span className="text-xs text-gray-500 flex items-center gap-2">
                                            <span>{vid.views} views</span>
                                            <span>•</span>
                                            <span>{Math.round(vid.duration)}s duration</span>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Kanban card tracking status */}
                <div className="bg-[#14121a] border border-[#201d2a] p-6 rounded-2xl space-y-6">
                    <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2 m-0">
                        <ClipboardList className="w-5 h-5 text-indigo-400" />
                        Production Tasks
                    </h2>

                    <div className="space-y-4">
                        {Object.entries(statsData.kanbanStats).map(([status, count]) => {
                            const percent = statsData.totalVideos ? Math.round((count / (Object.values(statsData.kanbanStats).reduce((a, b) => a + b, 0) || 1)) * 100) : 0;
                            return (
                                <div key={status} className="bg-[#1c1924] p-4 rounded-xl border border-[#2c2838]">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                            {status.replace("_", " ")}
                                        </span>
                                        <span className="text-xs font-bold text-indigo-400">
                                            {count} tasks
                                        </span>
                                    </div>
                                    <div className="w-full bg-[#201d2a] h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${percent || 5}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
