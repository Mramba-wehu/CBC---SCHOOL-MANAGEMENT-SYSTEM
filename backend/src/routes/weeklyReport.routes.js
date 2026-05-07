const express = require('express');
const router = express.Router();
const { generateWeeklyReports, getStudentWeeklyReports } = require('../controllers/weeklyReport.controller');
const { authenticate, authorize, ROLES } = require('../middleware/auth.middleware');

router.post('/generate', authenticate, authorize(...ROLES.ADMIN, 'CLASS_TEACHER'), generateWeeklyReports);
router.get('/student', authenticate, getStudentWeeklyReports);

module.exports = router;
