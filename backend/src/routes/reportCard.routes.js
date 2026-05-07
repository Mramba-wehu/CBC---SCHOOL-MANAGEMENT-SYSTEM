const express = require('express');
const router = express.Router();
const { aggregateReportCardData, updateApprovalStatus, generatePDF } = require('../controllers/reportCard.controller');
const { authenticate, authorize, ROLES } = require('../middleware/auth.middleware');

router.post('/aggregate', authenticate, authorize(...ROLES.TEACHERS, ...ROLES.ADMIN), aggregateReportCardData);
router.patch('/:id/approve', authenticate, authorize(...ROLES.TEACHERS, ...ROLES.ADMIN), updateApprovalStatus);
router.post('/:id/generate-pdf', authenticate, authorize(...ROLES.ADMIN), generatePDF);

module.exports = router;
