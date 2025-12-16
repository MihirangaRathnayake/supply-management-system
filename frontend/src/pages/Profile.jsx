import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUser, faLock, faPalette, faCircle, 
    faCamera, faSave, faTimes, faCheck 
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        profilePicture: null
    });
    
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    const [preferences, setPreferences] = useState({
        theme: 'light'
    });
    
    const [status, setStatus] = useState('free');

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            const res = await axios.get('/api/users/profile');
            const userData = res.data.data;
            
            setProfileData({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: userData.email || '',
                profilePicture: userData.profilePicture || null
            });
            
            setPreferences(userData.preferences || { theme: 'light' });
            setStatus(userData.status || 'free');
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        
        try {
            const res = await axios.put('/api/users/profile', {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                email: profileData.email
            });
            
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            
            const updatedUser = { ...user, ...res.data.data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to update profile' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            setLoading(false);
            return;
        }
        
        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            setLoading(false);
            return;
        }
        
        try {
            await axios.put('/api/users/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            
            setMessage({ type: 'success', text: 'Password updated successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to update password' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
            return;
        }
        
        const reader = new FileReader();
        reader.onloadend = async () => {
            const imageData = reader.result;
            
            try {
                setLoading(true);
                const res = await axios.post('/api/users/profile-picture', { imageData });
                
                setProfileData(prev => ({ ...prev, profilePicture: imageData }));
                setMessage({ type: 'success', text: 'Profile picture updated!' });
                
                const updatedUser = { ...user, profilePicture: imageData };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            } catch (error) {
                setMessage({ type: 'error', text: 'Failed to upload image' });
            } finally {
                setLoading(false);
            }
        };
        
        reader.readAsDataURL(file);
    };

    const handleThemeChange = async (theme) => {
        try {
            await axios.put('/api/users/preferences', { theme });
            setPreferences(prev => ({ ...prev, theme }));
            setMessage({ type: 'success', text: 'Theme updated!' });
            
            document.documentElement.classList.toggle('dark', theme === 'dark');
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update theme' });
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await axios.put('/api/users/status', { status: newStatus });
            setStatus(newStatus);
            setMessage({ type: 'success', text: 'Status updated!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update status' });
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: faUser },
        { id: 'security', label: 'Security', icon: faLock },
        { id: 'preferences', label: 'Preferences', icon: faPalette }
    ];

    const statusOptions = [
        { value: 'free', label: 'Free', color: 'bg-green-500' },
        { value: 'busy', label: 'Busy', color: 'bg-red-500' },
        { value: 'away', label: 'Away', color: 'bg-yellow-500' },
        { value: 'offline', label: 'Offline', color: 'bg-gray-500' }
    ];

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
                <p className="text-slate-600 mt-1">Manage your account settings and preferences</p>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-lg ${
                    message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
                    'bg-red-50 text-red-800 border border-red-200'
                }`}>
                    <FontAwesomeIcon icon={message.type === 'success' ? faCheck : faTimes} className="mr-2" />
                    {message.text}
                </div>
            )}

            <div className="card">
                <div className="border-b border-slate-200 mb-6">
                    <nav className="flex gap-4">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-primary-600 text-primary-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <FontAwesomeIcon icon={tab.icon} className="mr-2" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {activeTab === 'general' && (
                    <div>
                        <div className="flex items-center gap-6 mb-8">
                            <div className="relative">
                                {profileData.profilePicture ? (
                                    <img 
                                        src={profileData.profilePicture} 
                                        alt="Profile" 
                                        className="w-24 h-24 rounded-full object-cover border-4 border-slate-200"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-3xl font-bold border-4 border-slate-200">
                                        {profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}
                                    </div>
                                )}
                                <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                                    <FontAwesomeIcon icon={faCamera} />
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={handleImageUpload}
                                    />
                                </label>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-slate-900">
                                    {profileData.firstName} {profileData.lastName}
                                </h3>
                                <p className="text-slate-600">{profileData.email}</p>
                                <p className="text-sm text-slate-500 mt-1">Role: {user?.role}</p>
                            </div>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.firstName}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.lastName}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                                        className="input-field"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <button 
                                    type="submit" 
                                    className="btn-primary"
                                    disabled={loading}
                                >
                                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'security' && (
                    <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Current Password
                            </label>
                            <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                className="input-field"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                className="input-field"
                                required
                                minLength={6}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                className="input-field"
                                required
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <button 
                                type="submit" 
                                className="btn-primary"
                                disabled={loading}
                            >
                                <FontAwesomeIcon icon={faLock} className="mr-2" />
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === 'preferences' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Theme</h3>
                            <div className="grid grid-cols-3 gap-4 max-w-md">
                                {['light', 'dark', 'system'].map(theme => (
                                    <button
                                        key={theme}
                                        onClick={() => handleThemeChange(theme)}
                                        className={`p-4 rounded-lg border-2 transition-all ${
                                            preferences.theme === theme
                                                ? 'border-primary-600 bg-primary-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="text-center">
                                            <div className="text-2xl mb-2">
                                                {theme === 'light' && '☀️'}
                                                {theme === 'dark' && '🌙'}
                                                {theme === 'system' && '💻'}
                                            </div>
                                            <div className="text-sm font-medium capitalize">{theme}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Current Status</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl">
                                {statusOptions.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleStatusChange(option.value)}
                                        className={`p-3 rounded-lg border-2 transition-all ${
                                            status === option.value
                                                ? 'border-primary-600 bg-primary-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon 
                                                icon={faCircle} 
                                                className={`${option.color.replace('bg-', 'text-')} text-xs`}
                                            />
                                            <span className="text-sm font-medium">{option.label}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
