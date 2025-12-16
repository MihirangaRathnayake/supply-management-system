import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ToastContainer';
import ConfirmDialog from './ConfirmDialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faBell, faSearch, faUserCircle, faSignOutAlt, faUser, faCog } from '@fortawesome/free-solid-svg-icons';

const Navbar = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([
        {
            id: 'demo-1',
            title: 'Settings connected',
            message: 'System settings API is now online. You can save preferences.',
            time: 'Just now',
            unread: true
        }
    ]);

    const handleLogout = () => {
        logout();
        showToast('Logged out successfully. See you soon!', 'success');
        navigate('/login');
    };

    // Close user menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (showUserMenu && !event.target.closest('.user-menu-container')) {
                setShowUserMenu(false);
            }
            if (showNotifications && !event.target.closest('.notification-menu-container')) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showUserMenu, showNotifications]);

    const unreadCount = notifications.filter((n) => n.unread).length;
    const openNotifications = () => {
        setShowNotifications((prev) => !prev);
        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    };

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
                        <div className="relative notification-menu-container">
                            <button
                                className="p-2 text-slate-500 rounded-lg hover:bg-slate-100 focus:ring-2 focus:ring-slate-200 relative"
                                onClick={openNotifications}
                            >
                                <span className="sr-only">View notifications</span>
                                <FontAwesomeIcon icon={faBell} className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
                                )}
                            </button>
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50">
                                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">Notifications</p>
                                            <p className="text-xs text-slate-500">
                                                {notifications.length ? `${notifications.length} update${notifications.length > 1 ? 's' : ''}` : 'No new alerts'}
                                            </p>
                                        </div>
                                        <span className="text-xs text-blue-600 font-semibold">Live</span>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="px-4 py-6 text-sm text-slate-500 text-center">All caught up!</div>
                                        ) : (
                                            notifications.map((n) => (
                                                <div key={n.id} className="px-4 py-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                                                    <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                                                    <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                                                    <p className="text-[11px] text-slate-400 mt-1">{n.time}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center ml-3 relative user-menu-container">
                            <div className="flex items-center gap-3">
                                <div className="hidden md:block text-right">
                                    <p className="text-sm font-medium text-slate-900">{user?.firstName} {user?.lastName}</p>
                                    <p className="text-xs text-slate-500 truncate">{user?.role}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex text-sm bg-slate-800 rounded-full focus:ring-4 focus:ring-slate-300"
                                >
                                    <span className="sr-only">Open user menu</span>
                                    {user?.profilePicture ? (
                                        <img 
                                            src={user.profilePicture} 
                                            alt="Profile" 
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                        </div>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowLogoutConfirm(true)}
                                    className="ml-2 p-2 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                    title="Sign out"
                                >
                                    <FontAwesomeIcon icon={faSignOutAlt} />
                                </button>
                            </div>
                            
                            {showUserMenu && (
                                <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                                    <button
                                        onClick={() => {
                                            navigate('/profile');
                                            setShowUserMenu(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                    >
                                        <FontAwesomeIcon icon={faUser} className="text-slate-500" />
                                        Edit Profile
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigate('/settings');
                                            setShowUserMenu(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                    >
                                        <FontAwesomeIcon icon={faCog} className="text-slate-500" />
                                        Settings
                                    </button>
                                    <hr className="my-2 border-slate-200" />
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            setShowLogoutConfirm(true);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <FontAwesomeIcon icon={faSignOutAlt} />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                            
                            <ConfirmDialog
                                isOpen={showLogoutConfirm}
                                onClose={() => setShowLogoutConfirm(false)}
                                onConfirm={handleLogout}
                                title="Confirm Logout"
                                message="Are you sure you want to log out? You'll need to sign in again to access your account."
                                confirmText="Yes, Log Out"
                                cancelText="Cancel"
                                type="warning"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
