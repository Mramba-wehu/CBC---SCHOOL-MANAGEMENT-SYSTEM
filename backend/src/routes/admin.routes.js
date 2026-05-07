const express = require('express');
const router = express.Router();
const { promoteStudents, getFinancialSummary } = require('../controllers/admin.controller');
const { authenticate, authorize, ROLES } = require('../middleware/auth.middleware');

router.post('/promote', authenticate, authorize(...ROLES.ADMIN), promoteStudents);
router.get('/financial-summary', authenticate, authorize(...ROLES.ADMIN, 'BURSAR'), getFinancialSummary);

module.exports = router;
