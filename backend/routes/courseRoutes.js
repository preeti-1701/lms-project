const express = require('express');
const { createCourse, getAllCourses, enrollStudent, getStudentCourses } = require('../controllers/courseController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/create', authMiddleware, roleMiddleware('trainer'), createCourse);
router.get('/all', authMiddleware, getAllCourses);
router.post('/enroll', authMiddleware, roleMiddleware('admin'), enrollStudent);
router.get('/student-courses', authMiddleware, roleMiddleware('student'), getStudentCourses);

module.exports = router;
