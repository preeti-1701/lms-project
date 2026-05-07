const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate active session
    const session = await pool.query(
      'SELECT id FROM sessions WHERE user_id = $1 AND jwt_token = $2 AND is_active = true',
      [decoded.id, token]
    );
    if (session.rows.length === 0) {
      return res.status(401).json({ message: 'Session expired or logged in elsewhere' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { authenticate };
