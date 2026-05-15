const db = require('./config/db');

const sampleVideos = [
  'https://www.youtube.com/embed/SqcY0GlETPk',
  'https://www.youtube.com/embed/Ke90Tje7VS0',
  'https://www.youtube.com/embed/bMknfKXIFA8',
  'https://www.youtube.com/embed/7fPXI_MnBOY',
  'https://www.youtube.com/embed/00pxe601uyE',
];

const seedVideos = async () => {
  try {
    console.log('🚀 Starting video seeding process...');
    
    // 1. Get all courses
    const courses = await db.query('SELECT id, title FROM courses');
    
    if (courses.rows.length === 0) {
      console.log('❌ No courses found. Please create a course first.');
      process.exit(0);
    }

    for (const course of courses.rows) {
      console.log(`\nAdding 30 videos to course: "${course.title}" (ID: ${course.id})`);
      
      // Clear existing videos for this course to avoid duplicates if re-running
      await db.query('DELETE FROM videos WHERE course_id = $1', [course.id]);

      for (let i = 1; i <= 30; i++) {
        const title = `Day ${i}: ${course.title} - Chapter ${i}`;
        const url = sampleVideos[(i - 1) % sampleVideos.length];
        
        await db.query(
          'INSERT INTO videos (course_id, youtube_url, title, order_index) VALUES ($1, $2, $3, $4)',
          [course.id, url, title, i]
        );
        
        if (i % 10 === 0) process.stdout.write('.');
      }
      console.log(`\n✅ Added 30 videos to "${course.title}"`);
    }

    console.log('\n✨ Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedVideos();
