const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/password', userController.updatePassword);
router.post('/profile-picture', userController.uploadProfilePicture);
router.put('/preferences', userController.updatePreferences);
router.put('/status', userController.updateStatus);

module.exports = router;
