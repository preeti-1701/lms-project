const bcrypt = require('bcryptjs');
const db = require('../config/db');

// ─── GET ALL USERS ────────────────────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, email, role, status, created_at FROM users ORDER BY id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── CREATE USER ──────────────────────────────────────────────────────────────
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.query(
      'INSERT INTO users (name, email, password, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, status',
      [name, email, hashedPassword, role || 'student', 'active']
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── UPDATE USER ──────────────────────────────────────────────────────────────
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, status } = req.body;

    const result = await db.query(
      `UPDATE users
       SET name = COALESCE($1, name), role = COALESCE($2, role), status = COALESCE($3, status)
       WHERE id = $4
       RETURNING id, name, email, role, status`,
      [name, role, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── DELETE USER ──────────────────────────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── TOGGLE USER STATUS ───────────────────────────────────────────────────────
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active' or 'disabled'

    if (!['active', 'disabled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Use "active" or "disabled".' });
    }

    const result = await db.query(
      'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, name, status',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If disabling, also force-logout all sessions
    if (status === 'disabled') {
      await db.query(
        'UPDATE sessions SET active_status = false WHERE user_id = $1',
        [id]
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error during status toggle' });
  }
};

// ─── FORCE LOGOUT USER (Admin) ────────────────────────────────────────────────
exports.forceLogoutUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Invalidate ALL active sessions for this user
    const result = await db.query(
      'UPDATE sessions SET active_status = false WHERE user_id = $1 AND active_status = true RETURNING id',
      [id]
    );

    const sessionsTerminated = result.rowCount;
    console.log(`🔒 Admin force-logout: user_id=${id}, sessions terminated=${sessionsTerminated}`);

    res.json({
      message: `User has been force-logged out. ${sessionsTerminated} session(s) terminated.`,
      sessionsTerminated,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error during force logout' });
  }
};

// ─── GET ALL ACTIVE SESSIONS (Admin - IP & Device Tracking) ──────────────────
exports.getActiveSessions = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
         s.id        AS session_id,
         s.user_id,
         u.name      AS user_name,
         u.email     AS user_email,
         u.role,
         s.ip_address,
         s.device_info,
         s.created_at AS login_time,
         s.last_seen
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.active_status = true
       ORDER BY s.last_seen DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error fetching active sessions' });
  }
};

// ─── ENROLL STUDENT ───────────────────────────────────────────────────────────
exports.enrollStudent = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    const check = await db.query(
      'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [userId, courseId]
    );
    if (check.rows.length > 0) {
      return res.status(400).json({ error: 'User already enrolled in this course.' });
    }

    await db.query(
      'INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2)',
      [userId, courseId]
    );

    res.json({ message: 'User enrolled successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error during enrollment' });
  }
};
