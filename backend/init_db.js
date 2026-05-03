const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const init = async () => {
  const passwordHash = await bcrypt.hash('Admin@123', 12);

  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'trainer', 'student')),
      is_active INTEGER DEFAULT 1,
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Courses table
    db.run(`CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      created_by TEXT REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Videos table
    db.run(`CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      youtube_url TEXT NOT NULL,
      youtube_id TEXT NOT NULL,
      description TEXT,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // User-Course assignments
    db.run(`CREATE TABLE IF NOT EXISTS user_courses (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
      assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, course_id)
    )`);

    // Sessions table
    db.run(`CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      session_token TEXT NOT NULL,
      jwt_token TEXT NOT NULL,
      ip_address TEXT,
      device_info TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      logged_out_at DATETIME
    )`);

    // Default admin user
    db.run(`INSERT OR IGNORE INTO users (id, name, email, password_hash, role, is_active)
           VALUES (?, ?, ?, ?, ?, ?)`,
           [uuidv4(), 'System Admin', 'admin@lms.com', passwordHash, 'admin', 1]);

    console.log('Database initialized successfully with SQLite.');
  });
};

init();
