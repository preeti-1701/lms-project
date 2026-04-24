// course.routes.js
const express = require('express');
const router = express.Router();
const { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse } = require('../controllers/course.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.post('/', authorize('admin', 'trainer'), createCourse);
router.put('/:id', authorize('admin', 'trainer'), updateCourse);
router.delete('/:id', authorize('admin'), deleteCourse);

module.exports = router;
