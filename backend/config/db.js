const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'lms_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Test connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log('\n======================================================');
    console.log('❌ DATABASE CONNECTION FAILED!');
    console.log('======================================================');
    console.log('Error Details:', err.message);
    console.log('\nHOW TO FIX THIS:');
    if (err.message.includes('password authentication failed')) {
      console.log('Your PostgreSQL password in the backend/.env file is WRONG.');
      console.log('Open backend/.env and change DB_PASSWORD to the correct password you set when you installed PostgreSQL.');
    } else if (err.message.includes('database "lms_db" does not exist')) {
      console.log('You need to create the database in pgAdmin or psql first:');
      console.log('CREATE DATABASE lms_db;');
    } else {
      console.log('Make sure PostgreSQL is installed and running on your computer.');
    }
    console.log('======================================================\n');
  } else {
    console.log('✅ Successfully connected to PostgreSQL database!');
    // Auto-create video_progress table if it doesn't exist
    pool.query(`
      CREATE TABLE IF NOT EXISTS video_progress (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
        completed BOOLEAN DEFAULT TRUE,
        PRIMARY KEY (user_id, video_id)
      );
      
      -- Ensure timestamps exist for activity tracking
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollments' AND column_name='enrolled_at') THEN
          ALTER TABLE enrollments ADD COLUMN enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='video_progress' AND column_name='completed_at') THEN
          ALTER TABLE video_progress ADD COLUMN completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
      END $$;
    `).then(async () => {
      // Seed curriculum for the first course if it's empty or only has 1 lesson
      const courseRes = await pool.query('SELECT id FROM courses LIMIT 1');
      if (courseRes.rows.length > 0) {
        const courseId = courseRes.rows[0].id;
        const videoCount = await pool.query('SELECT COUNT(*) FROM videos WHERE course_id = $1', [courseId]);
        if (parseInt(videoCount.rows[0].count) <= 1) {
          console.log(`🌱 Seeding curriculum for Course ID: ${courseId}...`);
          const lessons = [
            ['React Hooks & State', 'https://www.youtube.com/watch?v=dpw9EHDh2bM', 2],
            ['Context API Mastery', 'https://www.youtube.com/watch?v=35lXWvCu78o', 3],
            ['Custom Hooks Design', 'https://www.youtube.com/watch?v=J-g9ZJQQ8U8', 4],
            ['Routing with React Router', 'https://www.youtube.com/watch?v=law2wIZKa8o', 5]
          ];
          for (const [title, url, order] of lessons) {
            await pool.query(
              'INSERT INTO videos (course_id, title, youtube_url, order_index) VALUES ($1, $2, $3, $4)',
              [courseId, title, url, order]
            );
          }
          console.log('✅ Curriculum seeded successfully!');
        }
      }
    }).catch(err => console.error('Error in seeding/migration:', err.message));
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
