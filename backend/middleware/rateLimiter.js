let loginLimiter;

try {
  const rateLimit = require('express-rate-limit');
  loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
  });
  console.log('🔒 Rate limiting: ENABLED (5 attempts / 15 min)');
} catch (e) {
  // Fallback: pass-through middleware if package not installed
  console.warn('⚠️  express-rate-limit not installed. Run: npm install express-rate-limit');
  loginLimiter = (req, res, next) => next();
}

module.exports = { loginLimiter };
