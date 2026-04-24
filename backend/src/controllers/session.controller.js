const pool = require('../config/database');

const getActiveSessions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.id, s.ip_address, s.device_info, s.created_at, s.expires_at,
         u.name, u.email, u.role
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.is_active = TRUE AND s.expires_at > NOW()
       ORDER BY s.created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const forceLogout = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const result = await pool.query(
      'UPDATE sessions SET is_active = FALSE WHERE id = $1 RETURNING id',
      [sessionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    await pool.query(
      'INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'FORCE_LOGOUT', 'session', sessionId, req.ip]
    );

    res.json({ success: true, message: 'Session terminated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const forceLogoutUser = async (req, res) => {
  try {
    const { userId } = req.params;

    await pool.query(
      'UPDATE sessions SET is_active = FALSE WHERE user_id = $1 AND is_active = TRUE',
      [userId]
    );

    await pool.query(
      'INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'FORCE_LOGOUT_USER', 'user', userId, req.ip]
    );

    res.json({ success: true, message: 'All user sessions terminated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const result = await pool.query(
      `SELECT al.*, u.name, u.email FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getActiveSessions, forceLogout, forceLogoutUser, getAuditLogs };
