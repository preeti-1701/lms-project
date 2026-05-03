const express = require('express');
const router  = express.Router();
const {
  getCourses, getCourseById, createCourse, updateCourse, deleteCourse,
  addVideo, updateVideo, deleteVideo, assignCourse, unassignCourse,
  getPublicCourses, enrollCourse,
} = require('../controllers/courseController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.use(auth);

// Static routes before /:id
router.get('/public', role('student'), getPublicCourses);

router.get('/',       getCourses);
router.get('/:id',    getCourseById);
router.post('/',      role('admin','trainer'), createCourse);
router.put('/:id',    role('admin','trainer'), updateCourse);
router.delete('/:id', role('admin'),           deleteCourse);

// Videos
router.post('/:id/videos',               role('admin','trainer'), addVideo);
router.put('/:id/videos/:videoId',       role('admin','trainer'), updateVideo);
router.delete('/:id/videos/:videoId',    role('admin','trainer'), deleteVideo);

// Assignment
router.post('/:id/assign',               role('admin','trainer'), assignCourse);
router.delete('/:id/assign/:studentId',  role('admin','trainer'), unassignCourse);

// Self-enroll
router.post('/:id/enroll', role('student'), enrollCourse);

module.exports = router;
