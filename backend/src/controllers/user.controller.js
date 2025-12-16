const userService = require('../services/user.service');
const { asyncHandler } = require('../middleware/error.middleware');

const getProfile = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const user = await userService.getUserProfile(userId);
    
    res.status(200).json({
        success: true,
        data: user
    });
});

const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const updates = req.body;
    
    const updatedUser = await userService.updateUserProfile(userId, updates);
    
    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
    });
});

const updatePassword = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;
    
    await userService.updatePassword(userId, currentPassword, newPassword);
    
    res.status(200).json({
        success: true,
        message: 'Password updated successfully'
    });
});

const uploadProfilePicture = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { imageData } = req.body;
    
    const updatedUser = await userService.uploadProfilePicture(userId, imageData);
    
    res.status(200).json({
        success: true,
        message: 'Profile picture updated successfully',
        data: updatedUser
    });
});

const updatePreferences = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const preferences = req.body;
    
    const updatedUser = await userService.updatePreferences(userId, preferences);
    
    res.status(200).json({
        success: true,
        message: 'Preferences updated successfully',
        data: updatedUser
    });
});

const updateStatus = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { status } = req.body;
    
    const updatedUser = await userService.updateStatus(userId, status);
    
    res.status(200).json({
        success: true,
        message: 'Status updated successfully',
        data: updatedUser
    });
});

module.exports = {
    getProfile,
    updateProfile,
    updatePassword,
    uploadProfilePicture,
    updatePreferences,
    updateStatus
};
