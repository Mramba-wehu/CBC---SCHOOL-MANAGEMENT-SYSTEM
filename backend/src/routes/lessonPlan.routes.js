const express = require('express');
const router = express.Router();
const { createLessonPlan, getMyLessonPlans, createSchemeOfWork, getSchemeOfWork } = require('../controllers/lessonPlan.controller');
const { authenticate, authorize, ROLES } = require('../middleware/auth.middleware');

router.post('/', authenticate, authorize(...ROLES.TEACHERS), createLessonPlan);
router.get('/my-plans', authenticate, authorize(...ROLES.TEACHERS), getMyLessonPlans);
router.post('/schemes', authenticate, authorize(...ROLES.TEACHERS), createSchemeOfWork);
router.get('/schemes', authenticate, getSchemeOfWork);

module.exports = router;
