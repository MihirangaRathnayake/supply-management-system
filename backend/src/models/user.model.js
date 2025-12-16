const { Schema, model, models } = require('mongoose');

const userSchema = new Schema(
    {
        userId: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        role: {
            type: String,
            enum: ['ADMIN', 'MANAGER', 'STAFF', 'VIEWER'],
            default: 'STAFF'
        },
        profilePicture: {
            type: String,
            default: null
        },
        preferences: {
            theme: {
                type: String,
                enum: ['light', 'dark', 'system'],
                default: 'light'
            },
            language: {
                type: String,
                default: 'en'
            },
            notifications: {
                email: { type: Boolean, default: true },
                push: { type: Boolean, default: true }
            }
        },
        status: {
            type: String,
            enum: ['free', 'busy', 'away', 'offline'],
            default: 'free'
        },
        lastLogin: {
            type: Date,
            default: null
        },
        resetToken: {
            type: String,
            default: null
        },
        resetTokenExpires: {
            type: Date,
            default: null
        },
        isActive: {
            type: Boolean,
            default: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        versionKey: false,
        collection: 'users',
        timestamps: true
    }
);

// Create unique indexes for faster queries
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ userId: 1 }, { unique: true });

module.exports = models.User || model('User', userSchema);
