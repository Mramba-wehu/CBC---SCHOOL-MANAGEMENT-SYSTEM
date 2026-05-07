const express = require('express');
const router = express.Router();
const { saveTimetable, getStreamTimetable, getTeacherTimetable } = require('../controllers/timetable.controller');
const { authenticate, authorize, ROLES } = require('../middleware/auth.middleware');

router.post('/', authenticate, authorize(...ROLES.ADMIN), saveTimetable);
router.get('/stream', authenticate, getStreamTimetable);
router.get('/teacher', authenticate, getTeacherTimetable);

module.exports = router;
