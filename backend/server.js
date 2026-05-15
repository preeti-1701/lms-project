require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();

// ── Helmet (security headers) — graceful fallback if not installed ────────────
try {
  const helmet = require('helmet');
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc:  ["'self'", "'unsafe-inline'"],
        styleSrc:   ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc:    ["'self'", "https://fonts.gstatic.com"],
        frameSrc:   ["'self'", "https://www.youtube.com"],
        imgSrc:     ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    frameguard: { action: 'sameorigin' },
  }));
  console.log('🔒 Helmet security headers: ENABLED');
} catch (e) {
  console.warn('⚠️  Helmet not installed. Run: npm install helmet');
}

// ── HTTPS redirect (production only) ─────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow no-origin requests (Postman, mobile)
    if (!origin) return callback(null, true);
    // In development, allow any localhost port
    if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost')) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// ── No-cache headers for all API responses ────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/users',   require('./routes/users'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/videos',  require('./routes/videos'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LMS Backend is running', secure: true });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(500).json({ error: 'Something went wrong!', ...(isDev && { details: err.message }) });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ LMS Server running on port ${PORT}`);
});
