const express = require('express');
const router = express.Router();
const { login, refreshToken, logout, getMe, changePassword, updateFcmToken } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.put('/change-password', authenticate, changePassword);
router.put('/fcm-token', authenticate, updateFcmToken);

module.exports = router;
