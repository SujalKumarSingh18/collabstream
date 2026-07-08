import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Kanban, RefreshCw, Film, MessageSquare } from "lucide-react";

function Sidebar() {
    const location = useLocation();

    // Navigation links helper
    const navItems = [
        { name: "Dashboard", path: "/", icon: LayoutDashboard },
        { name: "Videos Gallery", path: "/videos", icon: Film },
        { name: "Kanban Studio", path: "/kanban", icon: Kanban },
        { name: "Community Hub", path: "/community", icon: MessageSquare },
        { name: "Ad-Spend Converter", path: "/converter", icon: RefreshCw }
    ];

    return (
        <aside className="w-64 bg-[#14121a] border-r border-[#201d2a] flex flex-col shrink-0">
            {/* Brand Logo Header */}
            <div className="h-16 flex items-center px-6 border-b border-[#201d2a] gap-2.5">
                <Film className="w-6 h-6 text-indigo-400" />
                <span className="text-lg font-black tracking-wider bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                    CollabStream
                </span>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 py-6 px-4 space-y-1.5">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                isActive
                                    ? "bg-gradient-to-r from-indigo-600/15 to-violet-600/15 border-l-4 border-indigo-500 text-white"
                                    : "text-gray-400 hover:bg-[#1c1924] hover:text-gray-200"
                            }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? "text-indigo-400" : "text-gray-400"}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Sidebar Footer info */}
            <div className="p-4 border-t border-[#201d2a]">
                <div className="bg-[#1c1924] p-3 rounded-xl text-center">
                    <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                        Studio Mode
                    </span>
                    <span className="text-xs font-semibold text-indigo-400">
                        v1.0.0 (Beta)
                    </span>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
