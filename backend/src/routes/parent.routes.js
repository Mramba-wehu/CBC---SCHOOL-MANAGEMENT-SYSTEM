const express = require('express');
const router = express.Router();
const { getParents, getParent } = require('../controllers/parent.controller');
const { authenticate, authorize, ROLES } = require('../middleware/auth.middleware');

router.get('/', authenticate, authorize(...ROLES.ADMIN, 'RECEPTIONIST'), getParents);
router.get('/:id', authenticate, authorize(...ROLES.ADMIN, 'RECEPTIONIST'), getParent);

module.exports = router;
