const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const { Op } = require('sequelize');

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password required' });
    if (!['student', 'trainer'].includes(role)) return res.status(400).json({ message: 'Invalid role' });

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    // Auto static_user_id
    const prefix = role === 'trainer' ? 'T' : 'S';
    const existingUsers = await User.findAll({ where: { role }, attributes: ['static_user_id'] });
    let maxId = 0;
    existingUsers.forEach(u => {
      if (u.static_user_id) {
        const num = parseInt(u.static_user_id.replace(prefix, ''), 10);
        if (!isNaN(num) && num > maxId) maxId = num;
      }
    });
    const static_user_id = `${prefix}${maxId + 1}`;

    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password_hash, role, static_user_id });

    res.status(201).json({
      message: `Registration successful! Your ID: ${static_user_id}. Please login.`,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, static_user_id },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.is_active) return res.status(403).json({ message: 'Account disabled. Contact admin.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken({ id: user.id, role: user.role, email: user.email });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, static_user_id: user.static_user_id },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// POST /api/auth/forgot-password  (mock — returns token for reset)
const forgotPassword = async (req, res) => {
  res.json({ message: 'If this email exists, a reset link has been sent.' });
};

module.exports = { register, login, forgotPassword };
