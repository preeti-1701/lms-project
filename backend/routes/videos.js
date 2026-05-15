const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

router.put('/:id', requireRole(['admin', 'trainer']), videoController.updateVideo);
router.delete('/:id', requireRole(['admin', 'trainer']), videoController.deleteVideo);
router.post('/:id/toggle-progress', videoController.toggleVideoProgress);
router.get('/course/:courseId/progress', videoController.getVideoProgress);

module.exports = router;
