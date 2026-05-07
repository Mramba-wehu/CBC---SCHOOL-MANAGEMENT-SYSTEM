const express = require('express');
const router = express.Router();
const { createFeeStructure, generateInvoices, recordPayment, getArrears } = require('../controllers/billing.controller');
const { authenticate, authorize, ROLES } = require('../middleware/auth.middleware');

router.post('/structure', authenticate, authorize(...ROLES.ADMIN), createFeeStructure);
router.post('/generate-invoices', authenticate, authorize(...ROLES.ADMIN, 'BURSAR'), generateInvoices);
router.post('/payment', authenticate, authorize(...ROLES.ADMIN, 'BURSAR'), recordPayment);
router.get('/arrears', authenticate, authorize(...ROLES.ADMIN, 'BURSAR'), getArrears);

module.exports = router;
