const { Schema, model, models } = require('mongoose');

const settingsSchema = new Schema(
    {
        systemName: { type: String, default: 'Supply Management System' },
        defaultCurrency: { type: String, default: 'LKR' },
        timeZone: { type: String, default: 'Asia/Colombo' },
        systemEmailAlerts: { type: Boolean, default: true },
        lowStockAlerts: { type: Boolean, default: true },
        shipmentDelayNotifications: { type: Boolean, default: true },
        poApprovalNotifications: { type: Boolean, default: true },
        themeMode: { type: String, enum: ['light', 'dark'], default: 'light' },
        dashboardDensity: { type: String, enum: ['comfortable', 'compact'], default: 'comfortable' },
        defaultLandingPage: { type: String, enum: ['dashboard', 'inventory', 'orders'], default: 'dashboard' }
    },
    {
        collection: 'settings',
        timestamps: true,
        versionKey: false
    }
);

module.exports = models.Settings || model('Settings', settingsSchema);
