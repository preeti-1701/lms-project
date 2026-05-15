const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const videoController = require('../controllers/videoController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', courseController.getAllCourses);
router.get('/enrolled', courseController.getEnrolledCourses);
router.get('/available', courseController.getAvailableCourses);
router.post('/enroll/:id', courseController.enrollInCourse);
router.get('/:id', courseController.getCourseById);
router.get('/stats/summary', courseController.getDashboardStats);
router.get('/my-trainers', courseController.getMyTrainers);
router.get('/activity/recent', courseController.getRecentActivity);

// Only Admins and Trainers can modify courses
router.post('/', requireRole(['admin', 'trainer']), courseController.createCourse);
router.put('/:id', requireRole(['admin', 'trainer']), courseController.updateCourse);
router.delete('/:id', requireRole(['admin', 'trainer']), courseController.deleteCourse);

// Video routes nested under course
router.get('/:courseId/videos', videoController.getVideosByCourse);
router.post('/:courseId/videos', requireRole(['admin', 'trainer']), videoController.addVideo);

module.exports = router;
