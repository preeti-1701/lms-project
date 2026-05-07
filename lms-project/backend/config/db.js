const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../database.sqlite');

// Initialize database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('SQLite connection error:', err);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Helper to use Promises with SQLite (to match the pg pool.query style)
const pool = {
  query: (text, params = []) => {
    return new Promise((resolve, reject) => {
      // Convert PostgreSQL $1, $2 style to SQLite ? style if needed
      // Actually, I'll just use the SQLite style or replace $n with ?
      const sqliteQuery = text.replace(/\$(\d+)/g, '?');
      
      if (text.trim().toUpperCase().startsWith('SELECT')) {
        db.all(sqliteQuery, params, (err, rows) => {
          if (err) reject(err);
          else resolve({ rows });
        });
      } else {
        db.run(sqliteQuery, params, function(err) {
          if (err) reject(err);
          else resolve({ rows: [], lastID: this.lastID, changes: this.changes });
        });
      }
    });
  }
};

module.exports = pool;
