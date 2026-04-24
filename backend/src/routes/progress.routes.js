const express = require('express');
const router = express.Router();
const { updateProgress, getCourseProgress } = require('../controllers/progress.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.post('/', authorize('student'), updateProgress);
router.get('/course/:courseId', authorize('student'), getCourseProgress);

module.exports = router;
