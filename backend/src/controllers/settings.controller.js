const Settings = require('../models/settings.model');

const defaultSettings = {
    systemName: 'Supply Management System',
    defaultCurrency: 'LKR',
    timeZone: 'Asia/Colombo',
    systemEmailAlerts: true,
    lowStockAlerts: true,
    shipmentDelayNotifications: true,
    poApprovalNotifications: true,
    themeMode: 'light',
    dashboardDensity: 'comfortable',
    defaultLandingPage: 'dashboard'
};

async function getSettings(req, res, next) {
    try {
        let doc = await Settings.findOne({});
        if (!doc) {
            doc = await Settings.create(defaultSettings);
        }
        res.json({ success: true, data: doc });
    } catch (error) {
        error.statusCode = error.statusCode || 500;
        next(error);
    }
}

async function updateSettings(req, res, next) {
    try {
        const payload = {
            ...defaultSettings,
            ...req.body
        };

        const updated = await Settings.findOneAndUpdate({}, payload, {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        });

        res.json({ success: true, data: updated, message: 'Settings updated' });
    } catch (error) {
        error.statusCode = error.statusCode || 500;
        next(error);
    }
}

module.exports = {
    getSettings,
    updateSettings
};
