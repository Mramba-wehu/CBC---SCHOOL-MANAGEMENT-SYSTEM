const express = require('express');
const router = express.Router();
const { getStaff, getStaffMember, createStaffMember, updateStaffMember } = require('../controllers/staff.controller');
const { authenticate, authorize, ROLES } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', authenticate, authorize(...ROLES.ADMIN, 'RECEPTIONIST'), getStaff);
router.get('/:id', authenticate, getStaffMember);
router.post('/', authenticate, authorize(...ROLES.ADMIN), upload.single('photo'), createStaffMember);
router.put('/:id', authenticate, authorize(...ROLES.ADMIN), upload.single('photo'), updateStaffMember);

module.exports = router;
