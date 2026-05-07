const express = require('express');
const router = express.Router();
const { sendBulkNotification } = require('../controllers/notification.controller');
const { authenticate, authorize, ROLES } = require('../middleware/auth.middleware');

router.post('/bulk', authenticate, authorize(...ROLES.ADMIN), sendBulkNotification);

module.exports = router;
