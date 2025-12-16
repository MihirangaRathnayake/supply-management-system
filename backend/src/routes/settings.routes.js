const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { getSettings, updateSettings } = require('../controllers/settings.controller');

// Fetch current settings (creates defaults on first call)
router.get('/', authenticate, getSettings);

// Update settings
router.put('/', authenticate, updateSettings);

module.exports = router;
