const express = require('express');
const router = express.Router();
const { getActiveSessions, forceLogout, forceLogoutUser, getAuditLogs } = require('../controllers/session.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate, authorize('admin'));

router.get('/', getActiveSessions);
router.delete('/:sessionId', forceLogout);
router.delete('/user/:userId', forceLogoutUser);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
