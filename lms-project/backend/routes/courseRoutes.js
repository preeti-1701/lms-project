const express = require('express');
const router = express.Router();
const {
  getAllCourses, getStudentCourses, getCourseById,
  createCourse, updateCourse, deleteCourse
} = require('../controllers/courseController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', authenticate, authorize('admin', 'trainer'), getAllCourses);
router.get('/my-courses', authenticate, authorize('student'), getStudentCourses);
router.get('/:id', authenticate, getCourseById);
router.post('/', authenticate, authorize('admin', 'trainer'), createCourse);
router.put('/:id', authenticate, authorize('admin', 'trainer'), updateCourse);
router.delete('/:id', authenticate, authorize('admin'), deleteCourse);

module.exports = router;
