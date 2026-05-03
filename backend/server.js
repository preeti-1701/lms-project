require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./src/models');
const seedAdmin = require('./src/seedAdmin');

const authRoutes    = require('./src/routes/auth');
const userRoutes    = require('./src/routes/users');
const courseRoutes  = require('./src/routes/courses');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false }));
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (process.env.NODE_ENV === 'development' && /^http:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true);
    if (origin === process.env.FRONTEND_URL) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.set('trust proxy', 1);

app.use('/api/auth',    authRoutes);
app.use('/api/users',   userRoutes);
app.use('/api/courses', courseRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Tables synced');
    await seedAdmin();
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ Failed to start:', err);
    process.exit(1);
  }
};

start();
