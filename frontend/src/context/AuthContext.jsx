import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            // Check sessionStorage first (current session)
            let token = sessionStorage.getItem('token');
            let userStr = sessionStorage.getItem('user');
            
            // If not in session, check localStorage (for "Remember Me")
            if (!token) {
                const rememberMe = localStorage.getItem('rememberMe');
                if (rememberMe === 'true') {
                    token = localStorage.getItem('token');
                    userStr = localStorage.getItem('user');
                    
                    // Copy to sessionStorage for current session
                    if (token) {
                        sessionStorage.setItem('token', token);
                        sessionStorage.setItem('user', userStr);
                    }
                }
            }
            
            if (token) {
                try {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    // In a real app, verify token with backend
                    // const res = await axios.get('/api/auth/me');
                    // setUser(res.data.data);

                    // For demo, decode token or just set auth true
                    setIsAuthenticated(true);
                    setUser(JSON.parse(userStr) || {
                        firstName: 'Admin',
                        lastName: 'User',
                        role: 'ADMIN',
                        email: 'admin@example.com'
                    });
                } catch (error) {
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('user');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('rememberMe');
                    delete axios.defaults.headers.common['Authorization'];
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password, rememberMe = false) => {
        try {
            const res = await axios.post('/api/auth/login', { email, password });
            const { accessToken, refreshToken, user } = res.data.data;

            // Use sessionStorage for session-only persistence (clears on browser close)
            sessionStorage.setItem('token', accessToken);
            sessionStorage.setItem('user', JSON.stringify(user));
            sessionStorage.setItem('refreshToken', refreshToken);

            // If "Remember Me" is checked, also store in localStorage for persistence
            if (rememberMe) {
                localStorage.setItem('token', accessToken);
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('rememberMe', 'true');
            }

            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            setUser(user);
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Invalid email or password'
            };
        }
    };

    const logout = () => {
        // Clear session storage (always)
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.clear();
        
        // Clear local storage (for remember me)
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('rememberMe');
        
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
    };

    const register = async (userData) => {
        try {
            await axios.post('/api/auth/register', userData);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, register, loading, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
