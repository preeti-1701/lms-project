const express = require('express');
const router = express.Router();
const { addVideo, updateVideo, deleteVideo, getVideoToken } = require('../controllers/video.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.post('/', authorize('admin', 'trainer'), addVideo);
router.put('/:id', authorize('admin', 'trainer'), updateVideo);
router.delete('/:id', authorize('admin', 'trainer'), deleteVideo);
router.get('/:id/token', authorize('student'), getVideoToken);

module.exports = router;
