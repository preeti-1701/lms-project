const express = require('express');
const router = express.Router();
const { enrollStudent, unenrollStudent, getCourseStudents, bulkEnroll } = require('../controllers/enrollment.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate, authorize('admin', 'trainer'));

router.post('/', enrollStudent);
router.post('/bulk', bulkEnroll);
router.delete('/', unenrollStudent);
router.get('/course/:courseId/students', getCourseStudents);

module.exports = router;
