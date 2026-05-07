const express = require('express');
const router = express.Router();
const { getStudents, getStudent, createStudent, updateStudent, promoteStudent, getMyStudents } = require('../controllers/student.controller');
const { authenticate, authorize, ROLES } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', authenticate, authorize(...ROLES.ALL_STAFF), getStudents);
router.get('/my-students', authenticate, authorize(...ROLES.PARENT_STUDENT), getMyStudents);
router.get('/:id', authenticate, getStudent);
router.post('/', authenticate, authorize(...ROLES.ADMIN, 'RECEPTIONIST'), upload.single('photo'), createStudent);
router.put('/:id', authenticate, authorize(...ROLES.ADMIN), upload.single('photo'), updateStudent);
router.post('/:id/promote', authenticate, authorize(...ROLES.ADMIN), promoteStudent);

module.exports = router;
