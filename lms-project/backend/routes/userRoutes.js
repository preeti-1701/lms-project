const express = require('express');
const router = express.Router();
const {
  getAllUsers, createUser, updateUser, disableUser,
  assignCourse, removeCourse, getUserCourses
} = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', authenticate, authorize('admin', 'trainer'), getAllUsers);
router.post('/', authenticate, authorize('admin', 'trainer'), createUser);
router.put('/:id', authenticate, authorize('admin', 'trainer'), updateUser);
router.delete('/:id', authenticate, authorize('admin', 'trainer'), disableUser);
router.post('/assign-course', authenticate, authorize('admin', 'trainer'), assignCourse);
router.post('/remove-course', authenticate, authorize('admin', 'trainer'), removeCourse);
router.get('/:id/courses', authenticate, authorize('admin', 'trainer'), getUserCourses);

module.exports = router;
