const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, requireRole } = require('../middleware/auth');

// All user management routes require Auth + Admin role
router.use(requireAuth);
router.use(requireRole(['admin']));

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.patch('/:id/status', userController.toggleUserStatus);

// Security routes
router.post('/:id/force-logout', userController.forceLogoutUser);   // Admin force-logout user
router.get('/sessions/active', userController.getActiveSessions);   // View all active sessions (IP + device)
router.post('/:userId/enroll/:courseId', userController.enrollStudent);

module.exports = router;
