const express = require('express');
const router = express.Router();
const { getAnnouncements } = require('../controllers/announcement.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, getAnnouncements);

module.exports = router;
