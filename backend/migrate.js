require('dotenv').config();
const db = require('./config/db');

/**
 * migrate.js — Run this to apply incremental DB changes
 * safely without dropping existing data.
 *
 * Usage: node migrate.js
 */
async function migrate() {
  try {
    console.log('🔄 Running migrations...');

    // 1. video_progress table
    await db.query(`
      CREATE TABLE IF NOT EXISTS video_progress (
        user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
        video_id   INTEGER REFERENCES videos(id) ON DELETE CASCADE,
        completed  BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, video_id)
      );
    `);
    console.log('  ✅ video_progress table OK');

    // 2. Add last_seen column to sessions (if missing)
    await db.query(`
      ALTER TABLE sessions
        ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
    console.log('  ✅ sessions.last_seen column OK');

    // 3. Add created_at to users (if missing)
    await db.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
    console.log('  ✅ users.created_at column OK');

    // 4. Ensure active sessions index exists
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(active_status);
    `);
    console.log('  ✅ sessions active index OK');

    // 5. Ensure token index exists
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    `);
    console.log('  ✅ sessions token index OK');

    console.log('\n🎉 All migrations applied successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
