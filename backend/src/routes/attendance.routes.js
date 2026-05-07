const express = require('express');
const router = express.Router();
const { markAttendance, getStudentAttendance, bulkMarkAttendance } = require('../controllers/attendance.controller');
const { authenticate, authorize, ROLES } = require('../middleware/auth.middleware');

router.post('/', authenticate, authorize(...ROLES.TEACHERS), markAttendance);
router.post('/bulk', authenticate, authorize(...ROLES.TEACHERS), bulkMarkAttendance);
router.get('/student', authenticate, getStudentAttendance);

module.exports = router;
