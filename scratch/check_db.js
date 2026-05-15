const db = require('./backend/config/db');

async function checkColumns() {
  try {
    console.log('Checking video_progress columns...');
    const vp = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'video_progress'");
    console.log('video_progress:', vp.rows.map(r => r.column_name));

    console.log('\nChecking enrollments columns...');
    const en = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'enrollments'");
    console.log('enrollments:', en.rows.map(r => r.column_name));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkColumns();
