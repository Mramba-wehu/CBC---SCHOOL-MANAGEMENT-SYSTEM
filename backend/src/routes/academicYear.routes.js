const express = require('express');
const router = express.Router();
const { getAcademicYears, createAcademicYear, getCurrentTerm } = require('../controllers/academicYear.controller');
const { authenticate, authorize, ROLES } = require('../middleware/auth.middleware');

router.get('/', authenticate, getAcademicYears);
router.post('/', authenticate, authorize(...ROLES.ADMIN), createAcademicYear);
router.get('/current-term', authenticate, getCurrentTerm);

module.exports = router;
