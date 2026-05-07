const express = require('express');
const router = express.Router();
const { recordAssessment, getStudentAssessments } = require('../controllers/assessment.controller');
const { authenticate, authorize, ROLES } = require('../middleware/auth.middleware');

router.post('/', authenticate, authorize(...ROLES.TEACHERS), recordAssessment);
router.get('/student', authenticate, getStudentAssessments);

module.exports = router;
