import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faBell, faSearch, faUserCircle, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const Navbar = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();

    return (
        <nav className="fixed top-0 z-50 w-full bg-white border-b border-slate-200 lg:pl-64">
            <div className="px-3 py-3 lg:px-5 lg:pl-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-start">
                        <button
                            onClick={toggleSidebar}
                            type="button"
                            className="inline-flex items-center p-2 text-sm text-slate-500 rounded-lg lg:hidden hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        >
                            <span className="sr-only">Open sidebar</span>
                            <FontAwesomeIcon icon={faBars} className="w-6 h-6" />
                        </button>

                        {/* Search Bar */}
                        <div className="hidden md:block ml-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FontAwesomeIcon icon={faSearch} className="text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-64 p-2 pl-10 text-sm text-slate-900 border border-slate-300 rounded-lg bg-slate-50 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Search orders, products..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <button className="p-2 text-slate-500 rounded-lg hover:bg-slate-100 focus:ring-2 focus:ring-slate-200 relative">
                            <span className="sr-only">View notifications</span>
                            <FontAwesomeIcon icon={faBell} className="w-5 h-5" />
                            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
                        </button>

                        {/* User Menu */}
                        <div className="flex items-center ml-3">
                            <div className="flex items-center gap-3">
                                <div className="hidden md:block text-right">
                                    <p className="text-sm font-medium text-slate-900">{user?.firstName} {user?.lastName}</p>
                                    <p className="text-xs text-slate-500 truncate">{user?.role}</p>
                                </div>
                                <button
                                    type="button"
                                    className="flex text-sm bg-slate-800 rounded-full focus:ring-4 focus:ring-slate-300"
                                >
                                    <span className="sr-only">Open user menu</span>
                                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                    </div>
                                </button>
                                <button
                                    onClick={logout}
                                    className="ml-2 p-2 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                    title="Sign out"
                                >
                                    <FontAwesomeIcon icon={faSignOutAlt} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
