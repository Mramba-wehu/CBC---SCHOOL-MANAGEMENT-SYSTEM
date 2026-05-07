const express = require('express');
const router = express.Router();
const { getUsers, createUser, toggleUserStatus, resetUserPassword } = require('../controllers/user.controller');
const { authenticate, authorize, ROLES } = require('../middleware/auth.middleware');

router.get('/', authenticate, authorize(...ROLES.ADMIN), getUsers);
router.post('/', authenticate, authorize(...ROLES.SUPER_ADMIN), createUser);
router.patch('/:id/status', authenticate, authorize(...ROLES.SUPER_ADMIN), toggleUserStatus);
router.patch('/:id/reset-password', authenticate, authorize(...ROLES.SUPER_ADMIN), resetUserPassword);

module.exports = router;
