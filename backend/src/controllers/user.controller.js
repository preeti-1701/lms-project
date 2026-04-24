const bcrypt = require('bcrypt');
const pool = require('../config/database');

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, mobile, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, mobile, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and role are required' });
    }

    const validRoles = ['admin', 'trainer', 'student'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    // Check duplicate
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (name, email, mobile, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, mobile, role, is_active, created_at',
      [name, email, mobile || null, passwordHash, role]
    );

    await pool.query(
      'INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'CREATE_USER', 'user', result.rows[0].id, req.ip]
    );

    res.status(201).json({ success: true, message: 'User created successfully', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, mobile, role } = req.body;

    const result = await pool.query(
      'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), mobile = COALESCE($3, mobile), role = COALESCE($4, role), updated_at = NOW() WHERE id = $5 RETURNING id, name, email, mobile, role, is_active',
      [name, email, mobile, role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User updated successfully', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE users SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1 RETURNING id, name, is_active',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If disabling, invalidate all sessions
    if (!result.rows[0].is_active) {
      await pool.query('UPDATE sessions SET is_active = FALSE WHERE user_id = $1', [id]);
    }

    res.json({ success: true, message: `User ${result.rows[0].is_active ? 'enabled' : 'disabled'} successfully`, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, id]);

    // Invalidate all sessions
    await pool.query('UPDATE sessions SET is_active = FALSE WHERE user_id = $1', [id]);

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getAllUsers, createUser, updateUser, toggleUserStatus, resetUserPassword };
