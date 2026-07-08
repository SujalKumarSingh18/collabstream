import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import Header from "./components/Header/Header.jsx";
import axios from "axios";

function Layout() {
    const navigate = useNavigate();
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Check if user session cookies are valid
                await axios.get("/api/v1/users/current-user");
                setAuthLoading(false);
            } catch (error) {
                // If unauthorized or not logged in, redirect to login page
                navigate("/login");
            }
        };
        checkAuth();
    }, [navigate]);

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0c0a0f] text-gray-100">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#0c0a0f] text-gray-100 font-sans">
            {/* Sidebar navigation */}
            <Sidebar />

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header panel */}
                <Header />

                {/* Render page contents */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default Layout;
