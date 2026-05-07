const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const addUsers = async () => {
  const trainerHash = await bcrypt.hash('Trainer@123', 12);
  const studentHash = await bcrypt.hash('Student@123', 12);

  db.serialize(() => {
    // Add Trainer
    db.run(`INSERT OR IGNORE INTO users (id, name, email, password_hash, role, is_active)
           VALUES (?, ?, ?, ?, ?, ?)`,
           [uuidv4(), 'Sample Trainer', 'trainer@lms.com', trainerHash, 'trainer', 1]);

    // Add Student
    db.run(`INSERT OR IGNORE INTO users (id, name, email, password_hash, role, is_active)
           VALUES (?, ?, ?, ?, ?, ?)`,
           [uuidv4(), 'Sample Student', 'student@lms.com', studentHash, 'student', 1]);

    console.log('Sample Trainer and Student accounts created successfully.');
  });
};

addUsers();
