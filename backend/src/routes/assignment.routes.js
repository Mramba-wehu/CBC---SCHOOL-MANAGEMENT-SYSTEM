const express = require('express');
const router = express.Router();
const { createAssignment, submitAssignment, gradeSubmission, getAssignments } = require('../controllers/assignment.controller');
const { authenticate, authorize, ROLES } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', authenticate, getAssignments);
router.post('/', authenticate, authorize(...ROLES.TEACHERS), upload.array('attachments', 5), createAssignment);
router.post('/submit', authenticate, authorize('STUDENT'), upload.array('attachments', 5), submitAssignment);
router.patch('/grade/:submissionId', authenticate, authorize(...ROLES.TEACHERS), gradeSubmission);

module.exports = router;
