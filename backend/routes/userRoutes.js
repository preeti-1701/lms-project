const express = require('express');
const { createUser, listUsers } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/create', authMiddleware, roleMiddleware('admin'), createUser);
router.get('/all', authMiddleware, roleMiddleware('admin'), listUsers);

module.exports = router;
