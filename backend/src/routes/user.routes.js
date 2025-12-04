const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, (req, res) => {
    res.json({ success: true, message: 'Users endpoint placeholder' });
});

module.exports = router;
