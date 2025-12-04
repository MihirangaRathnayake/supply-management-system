/**
 * Auth Controller
 * ===============
 * Handles authentication requests
 */

const authService = require('../services/auth.service');
const { asyncHandler } = require('../middleware/error.middleware');

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

module.exports = {
    register,
    login,
    refreshToken,
    getProfile
};
