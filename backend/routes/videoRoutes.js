const express = require('express');
const { addVideo, getVideosByCourse } = require('../controllers/videoController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/add', authMiddleware, roleMiddleware('trainer'), addVideo);
router.get('/:courseId', authMiddleware, getVideosByCourse);

module.exports = router;
