const express = require('express');
const router  = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.use(auth);

router.get('/',    role('admin', 'trainer'), getUsers);
router.post('/',   role('admin'),            createUser);
router.put('/:id', role('admin'),            updateUser);
router.delete('/:id', role('admin'),         deleteUser);

module.exports = router;
