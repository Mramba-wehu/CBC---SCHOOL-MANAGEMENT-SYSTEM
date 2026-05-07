const express = require('express');
const router = express.Router();
const { getSubjects, createSubject, getStrands } = require('../controllers/subject.controller');
const { authenticate, authorize, ROLES } = require('../middleware/auth.middleware');

router.get('/', authenticate, getSubjects);
router.post('/', authenticate, authorize(...ROLES.ADMIN), createSubject);
router.get('/curriculum/strands', authenticate, getStrands);

module.exports = router;
