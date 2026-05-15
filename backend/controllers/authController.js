const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const generateToken = (userId, role) => {
  const payload = { user: { id: userId, role } };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // 1. Check if user exists
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid Credentials' });
    }

    const user = userResult.rows[0];

    // 2. Check if user is disabled
    if (user.status === 'disabled') {
      return res.status(403).json({ error: 'Account disabled. Contact Admin.' });
    }

    // 3. Check password (bcrypt encrypted)
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid Credentials' });
    }

    // 4. ── SINGLE SESSION: Invalidate ALL previous active sessions ──────────
    await db.query(
      'UPDATE sessions SET active_status = false WHERE user_id = $1 AND active_status = true',
      [user.id]
    );

    // 5. Generate new JWT token
    const token = generateToken(user.id, user.role);

    // 6. Track IP address and device info, save new session
    const ipAddress =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.ip ||
      req.connection.remoteAddress ||
      'unknown';
    const deviceInfo = req.headers['user-agent'] || 'unknown';

    await db.query(
      `INSERT INTO sessions (user_id, token, ip_address, device_info, active_status)
       VALUES ($1, $2, $3, $4, true)`,
      [user.id, token, ipAddress, deviceInfo]
    );

    console.log(`✅ Login: user=${user.email} | ip=${ipAddress} | role=${user.role}`);

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// ─── REGISTER ─────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    // Password strength check
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    // Check duplicate email
    const userResult = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Encrypt password with bcrypt (salt rounds = 12)
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.query(
      'INSERT INTO users (name, email, password, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      [name, email, hashedPassword, role || 'student', 'active']
    );

    res.status(201).json({
      message: 'User registered successfully. Please login.',
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
exports.logout = async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      await db.query(
        'UPDATE sessions SET active_status = false WHERE token = $1',
        [token]
      );
    }

    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    console.error('Logout error:', err.message);
    res.status(500).json({ error: 'Server error during logout' });
  }
};

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const userResult = await db.query(
      'SELECT id, name, email, role, status, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(userResult.rows[0]);
  } catch (err) {
    console.error('GetMe error:', err.message);
    res.status(500).json({ error: 'Server error while fetching user info' });
  }
};

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    const emailCheck = await db.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, userId]
    );
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email is already taken by another account.' });
    }

    const result = await db.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, role, status',
      [name, email, userId]
    );

    res.json({ message: 'Profile updated successfully', user: result.rows[0] });
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters.' });
    }

    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    // Encrypt new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);

    // Invalidate all other sessions after password change (security best practice)
    const authHeader = req.header('Authorization');
    const currentToken = authHeader && authHeader.split(' ')[1];
    await db.query(
      'UPDATE sessions SET active_status = false WHERE user_id = $1 AND token != $2',
      [userId, currentToken]
    );

    res.json({ message: 'Password changed successfully. Other sessions have been logged out.' });
  } catch (err) {
    console.error('Change password error:', err.message);
    res.status(500).json({ error: 'Failed to change password' });
  }
};
