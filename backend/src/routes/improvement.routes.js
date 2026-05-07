const express = require('express');
const router = express.Router();
const { addImprovementMaterial, getSuggestedMaterials } = require('../controllers/improvement.controller');
const { authenticate, authorize, ROLES } = require('../middleware/auth.middleware');

router.post('/', authenticate, authorize(...ROLES.TEACHERS), addImprovementMaterial);
router.get('/suggestions', authenticate, getSuggestedMaterials);

module.exports = router;
