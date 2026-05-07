const express = require('express');
const router = express.Router();
const { getDashboards } = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, getDashboards);

module.exports = router;
