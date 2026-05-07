const express = require('express');
const router = express.Router();
const { getGrades, createGrade, createStream, getStreamsByGrade } = require('../controllers/grade.controller');
const { authenticate, authorize, ROLES } = require('../middleware/auth.middleware');

router.get('/', authenticate, getGrades);
router.post('/', authenticate, authorize(...ROLES.ADMIN), createGrade);
router.post('/streams', authenticate, authorize(...ROLES.ADMIN), createStream);
router.get('/:gradeId/streams', authenticate, getStreamsByGrade);

module.exports = router;
