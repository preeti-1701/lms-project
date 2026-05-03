const express = require('express');
const router = express.Router();
const { addVideo, updateVideo, deleteVideo } = require('../controllers/videoController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', authenticate, authorize('admin', 'trainer'), addVideo);
router.put('/:id', authenticate, authorize('admin', 'trainer'), updateVideo);
router.delete('/:id', authenticate, authorize('admin'), deleteVideo);

module.exports = router;
