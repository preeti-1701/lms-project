const pool = require('../config/db');

exports.getAllSessions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.id, s.user_id, u.name, u.email, u.role, s.ip_address, s.device_info,
       s.is_active, s.created_at, s.logged_out_at
       FROM sessions s JOIN users u ON s.user_id = u.id
       ORDER BY s.created_at DESC LIMIT 100`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.forceLogout = async (req, res) => {
  try {
    const { userId } = req.params;
    await pool.query(
      'UPDATE sessions SET is_active=0, logged_out_at=CURRENT_TIMESTAMP WHERE user_id=$1 AND is_active=1',
      [userId]
    );
    res.json({ message: 'User sessions terminated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
