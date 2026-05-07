const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const resetPasswords = async () => {
  const newHash = await bcrypt.hash('12345678', 12);

  db.serialize(() => {
    // Update all test accounts
    db.run(`UPDATE users SET password_hash = ? WHERE email IN (?, ?, ?)`,
           [newHash, 'admin@lms.com', 'trainer@lms.com', 'student@lms.com'],
           function(err) {
             if (err) {
               console.error('Error updating passwords:', err.message);
             } else {
               console.log(`Successfully updated ${this.changes} accounts with password "12345678"`);
             }
           });
  });
};

resetPasswords();
