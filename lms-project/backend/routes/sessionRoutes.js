const express = require('express');
const router = express.Router();
const { getAllSessions, forceLogout } = require('../controllers/sessionController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', authenticate, authorize('admin'), getAllSessions);
router.post('/force-logout/:userId', authenticate, authorize('admin'), forceLogout);

module.exports = router;
