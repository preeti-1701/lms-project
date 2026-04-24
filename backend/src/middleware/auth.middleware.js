const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate session is still active in DB
    const sessionResult = await pool.query(
      'SELECT s.*, u.role, u.is_active, u.name, u.email FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = $1 AND s.is_active = TRUE AND s.expires_at > NOW()',
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Session expired or invalid' });
    }

    const session = sessionResult.rows[0];

    if (!session.is_active) {
      return res.status(401).json({ success: false, message: 'Account is disabled' });
    }

    req.user = {
      id: decoded.userId,
      role: session.role,
      name: session.name,
      email: session.email,
    };
    req.token = token;
    req.sessionId = session.id;

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    next(err);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
