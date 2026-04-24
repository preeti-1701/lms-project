const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, updateUser, toggleUserStatus, resetUserPassword } = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', authorize('admin'), getAllUsers);
router.post('/', authorize('admin'), createUser);
router.put('/:id', authorize('admin'), updateUser);
router.patch('/:id/toggle-status', authorize('admin'), toggleUserStatus);
router.post('/:id/reset-password', authorize('admin'), resetUserPassword);

module.exports = router;
