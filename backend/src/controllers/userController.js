const bcrypt = require('bcryptjs');
const { User } = require('../models');

// GET /api/users — admin only
const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const where = role ? { role } : {};
    const users = await User.findAll({
      where,
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']],
    });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/users — admin creates user
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ message: 'All fields required' });

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email already exists' });

    let static_user_id = null;
    if (role === 'trainer' || role === 'student') {
      const prefix = role === 'trainer' ? 'T' : 'S';
      const existingUsers = await User.findAll({ where: { role }, attributes: ['static_user_id'] });
      let maxId = 0;
      existingUsers.forEach(u => {
        if (u.static_user_id) {
          const num = parseInt(u.static_user_id.replace(prefix, ''), 10);
          if (!isNaN(num) && num > maxId) maxId = num;
        }
      });
      static_user_id = `${prefix}${maxId + 1}`;
    } else {
      static_user_id = `ADMIN-${Date.now()}`;
    }

    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password_hash, role, static_user_id });

    res.status(201).json({
      message: 'User created',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, static_user_id },
    });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/users/:id — admin edits / toggles active
const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, role, is_active, password } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role;
    if (is_active !== undefined) updates.is_active = is_active;
    if (password) updates.password_hash = await bcrypt.hash(password, 12);

    await user.update(updates);
    res.json({ message: 'User updated', user: { id: user.id, name: user.name, role: user.role, is_active: user.is_active } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/users/:id — admin deletes user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin' });
    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };
