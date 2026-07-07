import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import axios from "axios";

function Header() {
    const location = useLocation();
    const navigate = useNavigate();

    // Map route paths to human-readable page titles
    const getPageTitle = () => {
        switch (location.pathname) {
            case "/":
                return "Creator Dashboard";
            case "/kanban":
                return "Kanban Production Board";
            case "/converter":
                return "Ad-Spend Currency Converter";
            default:
                return "Studio Panel";
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post("/api/v1/users/logout");
            // Clear credentials and navigate to login
            navigate("/login");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <header className="h-16 border-b border-[#201d2a] bg-[#14121a] flex items-center justify-between px-8 shrink-0">
            {/* Title */}
            <div>
                <h1 className="text-xl font-black text-white m-0 tracking-tight">
                    {getPageTitle()}
                </h1>
            </div>

            {/* Profile actions */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2.5 bg-[#1c1924] border border-[#2c2838] px-3.5 py-1.5 rounded-full">
                    <User className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-gray-200">
                        Creator Channel
                    </span>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-150 cursor-pointer"
                    title="Log Out"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}

export default Header;
