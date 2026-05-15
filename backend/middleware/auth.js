const jwt = require('jsonwebtoken');
const db = require('../config/db');

// ─── TOKEN + SESSION VALIDATION MIDDLEWARE ────────────────────────────────────
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: token missing.' });
    }

    const token = authHeader.split(' ')[1];

    // 1. Verify JWT signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({ error: 'Invalid or expired token. Please login again.' });
    }

    req.user = decoded.user;

    // 2. Validate session exists AND is still active in the database
    //    This is the key check for: force-logout, single-session, auto-logout
    const sessionCheck = await db.query(
      `SELECT id, active_status, last_seen FROM sessions
       WHERE token = $1 AND user_id = $2`,
      [token, req.user.id]
    );

    if (sessionCheck.rows.length === 0) {
      return res.status(401).json({ error: 'Session not found. Please login again.' });
    }

    if (!sessionCheck.rows[0].active_status) {
      return res.status(401).json({
        error: 'Session expired or logged out from another device. Please login again.',
      });
    }

    // 3. Update last_seen timestamp (heartbeat) — non-blocking
    db.query('UPDATE sessions SET last_seen = NOW() WHERE id = $1', [sessionCheck.rows[0].id])
      .catch(() => {}); // Silently ignore if column not migrated yet

    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ error: 'Authentication failed.' });
  }
};

// ─── ROLE-BASED ACCESS CONTROL MIDDLEWARE ─────────────────────────────────────
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions.' });
    }
    next();
  };
};

module.exports = { requireAuth, requireRole };
