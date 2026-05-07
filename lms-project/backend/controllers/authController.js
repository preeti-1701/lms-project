const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const UAParser = require('ua-parser-js');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = 1',
      [email.toLowerCase().trim()]
    );
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Invalidate all previous active sessions (single session enforcement)
    await pool.query(
      'UPDATE sessions SET is_active = 0, logged_out_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND is_active = 1',
      [user.id]
    );

    const parser = new UAParser(req.headers['user-agent']);
    const ua = parser.getResult();
    const deviceInfo = `${ua.browser.name || 'Unknown'} on ${ua.os.name || 'Unknown'}`;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';

    const sessionToken = uuidv4();
    const token = generateToken(user);

    const id = uuidv4();
    await pool.query(
      `INSERT INTO sessions (id, user_id, session_token, jwt_token, ip_address, device_info, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, 1)`,
      [id, user.id, sessionToken, token, ip, deviceInfo]
    );

    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    res.json({
      token,
      sessionToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);
    const id = uuidv4();

    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, $5, 1)`,
      [id, name, email.toLowerCase().trim(), password_hash, role || 'student']
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = async (req, res) => {
  try {
    await pool.query(
      'UPDATE sessions SET is_active = 0, logged_out_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND is_active = 1',
      [req.user.id]
    );
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, last_login FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
