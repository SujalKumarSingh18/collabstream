import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import Header from "./components/Header/Header.jsx";

function Layout() {
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
                    {/* HINT for creators: Customize padding or add transitions here */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default Layout;
