import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Kanban, RefreshCw, Film, MessageSquare, Sun, Moon } from "lucide-react";

function Sidebar() {
    const location = useLocation();

    // Check localStorage for past theme setting, default to dark
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem("theme") !== "light";
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.remove("light-theme");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.add("light-theme");
            localStorage.setItem("theme", "light");
        }
    }, [isDarkMode]);

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
            <Link
                to="/videos"
                className="h-16 flex items-center px-6 border-b border-[#201d2a] gap-2.5 hover:opacity-90 transition-opacity cursor-pointer"
            >
                <Film className="w-6 h-6 text-indigo-400" />
                <span className="text-lg font-black tracking-wider bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                    CollabStream
                </span>
            </Link>

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

            {/* Theme Toggler Footer */}
            <div className="p-4 border-t border-[#201d2a]">
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="w-full flex items-center justify-between bg-[#1c1924] px-4 py-2.5 rounded-xl border border-[#2c2838] hover:border-indigo-500/40 text-gray-400 hover:text-gray-200 transition-all duration-150 cursor-pointer"
                    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    <span className="text-xs font-bold uppercase tracking-wider">
                        {isDarkMode ? "Dark Theme" : "Light Theme"}
                    </span>
                    {isDarkMode ? (
                        <Moon className="w-4 h-4 text-indigo-400" />
                    ) : (
                        <Sun className="w-4 h-4 text-amber-500 animate-pulse" />
                    )}
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
