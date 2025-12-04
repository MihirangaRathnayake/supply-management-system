import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar toggleSidebar={toggleSidebar} />
            <Sidebar isOpen={sidebarOpen} />

            <div className="p-4 lg:ml-64 pt-20">
                <div className="p-4 rounded-lg mt-2">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;
