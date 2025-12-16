const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

class UserService {
    async getUserProfile(userId) {
        const user = await User.findOne({ userId }).select('-password');
        
        if (!user) {
            throw new Error('User not found');
        }
        
        return user;
    }

    async updateUserProfile(userId, updates) {
        const allowedUpdates = ['firstName', 'lastName', 'email'];
        const filteredUpdates = {};
        
        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) {
                filteredUpdates[field] = updates[field];
            }
        });
        
        if (filteredUpdates.email) {
            const existingUser = await User.findOne({ 
                email: filteredUpdates.email,
                userId: { $ne: userId }
            });
            
            if (existingUser) {
                throw new Error('Email already in use');
            }
        }
        
        const user = await User.findOneAndUpdate(
            { userId },
            { $set: { ...filteredUpdates, updatedAt: new Date() } },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            throw new Error('User not found');
        }
        
        return user;
    }

    async updatePassword(userId, currentPassword, newPassword) {
        const user = await User.findOne({ userId });
        
        if (!user) {
            throw new Error('User not found');
        }
        
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        
        if (!isMatch) {
            throw new Error('Current password is incorrect');
        }
        
        if (newPassword.length < 6) {
            throw new Error('New password must be at least 6 characters');
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await User.findOneAndUpdate(
            { userId },
            { $set: { password: hashedPassword, updatedAt: new Date() } }
        );
        
        return true;
    }

    async uploadProfilePicture(userId, imageData) {
        if (!imageData || !imageData.startsWith('data:image')) {
            throw new Error('Invalid image data');
        }
        
        const user = await User.findOneAndUpdate(
            { userId },
            { $set: { profilePicture: imageData, updatedAt: new Date() } },
            { new: true }
        ).select('-password');
        
        if (!user) {
            throw new Error('User not found');
        }
        
        return user;
    }

    async updatePreferences(userId, preferences) {
        const user = await User.findOneAndUpdate(
            { userId },
            { $set: { preferences, updatedAt: new Date() } },
            { new: true }
        ).select('-password');
        
        if (!user) {
            throw new Error('User not found');
        }
        
        return user;
    }

    async updateStatus(userId, status) {
        const validStatuses = ['free', 'busy', 'away', 'offline'];
        
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status');
        }
        
        const user = await User.findOneAndUpdate(
            { userId },
            { $set: { status, updatedAt: new Date() } },
            { new: true }
        ).select('-password');
        
        if (!user) {
            throw new Error('User not found');
        }
        
        return user;
    }
}

module.exports = new UserService();
