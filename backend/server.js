require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool, testConnection } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const videoRoutes = require('./routes/videoRoutes');



const app = express();
app.use(cors());
app.use(express.json());

// ============================================================================
// API Routes
// ============================================================================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/video', videoRoutes);

// ============================================================================
// Health Check Endpoint
// ============================================================================
app.get('/', (req, res) => {
  res.json({ 
    message: 'LMS backend is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health endpoint that includes database status
app.get('/api/health', async (req, res) => {
  try {
    const dbHealthResult = await pool.query('SELECT NOW()');
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// ============================================================================
// Start Server
// ============================================================================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection before starting server
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error(' Database connection failed. Exiting...');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`\n✓ Server listening on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ API base URL: http://localhost:${PORT}/api\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
console.log("ENV PASSWORD:", process.env.DB_PASSWORD);