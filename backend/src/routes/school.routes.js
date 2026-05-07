const express = require('express');
const router = express.Router();
const { getSchoolProfile, updateSchoolProfile } = require('../controllers/school.controller');
const { authenticate, authorize, ROLES } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', getSchoolProfile);
router.put('/', authenticate, authorize(...ROLES.SUPER_ADMIN), upload.single('logo'), updateSchoolProfile);

module.exports = router;
