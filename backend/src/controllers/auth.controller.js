/**
 * Auth Controller
 * ===============
 * Handles authentication requests
 */

const authService = require('../services/auth.service');
const { asyncHandler, ApiError } = require('../middleware/error.middleware');

const register = asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);
    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: user
    });
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
    });
});

const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    const tokens = await authService.refreshToken(refreshToken);

    res.status(200).json({
        success: true,
        data: tokens
    });
});

const getProfile = asyncHandler(async (req, res) => {
    // User is already attached to req by auth middleware
    res.status(200).json({
        success: true,
        data: req.user
    });
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) throw ApiError.badRequest('Email is required');

    // Generate and store reset token (Mongo) + best-effort Oracle lookup
    const result = await authService.forgotPassword(email);

    // Do not leak existence; return generic message and (for dev) the token payload
    res.status(200).json({
        success: true,
        message: 'If an account exists with this email, password reset instructions have been sent.',
        data: process.env.NODE_ENV === 'development' ? result : undefined
    });
});

const resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) throw ApiError.badRequest('Token and new password are required');
    if (String(newPassword).length < 6) throw ApiError.badRequest('Password must be at least 6 characters');

    const result = await authService.resetPassword(token, newPassword);

    res.status(200).json({
        success: true,
        message: 'Password has been reset successfully',
        data: process.env.NODE_ENV === 'development' ? result : undefined
    });
});

module.exports = {
    register,
    login,
    refreshToken,
    getProfile,
    forgotPassword,
    resetPassword
};
