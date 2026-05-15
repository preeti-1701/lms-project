const db = require('../config/db');

exports.getAllCourses = async (req, res) => {
  try {
    let query = `
      SELECT c.id, c.title, c.description, c.created_at, u.name as created_by_name,
      (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as enrollment_count
      FROM courses c 
      LEFT JOIN users u ON c.created_by = u.id
      ORDER BY c.created_at DESC
    `;

    // If student, only return assigned courses
    if (req.user.role === 'student') {
      query = `
        SELECT c.id, c.title, c.description, c.created_at, u.name as created_by_name 
        FROM courses c 
        JOIN enrollments e ON c.id = e.course_id
        LEFT JOIN users u ON c.created_by = u.id
        WHERE e.user_id = $1
        ORDER BY c.created_at DESC
      `;
      const result = await db.query(query, [req.user.id]);
      return res.json(result.rows);
    }

    // Admin and Trainer see all courses
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT c.*, u.name as created_by_name,
      (
        SELECT COUNT(v.id) FROM videos v WHERE v.course_id = c.id
      ) as total_videos,
      (
        SELECT COUNT(vp.video_id) 
        FROM video_progress vp 
        JOIN videos v ON vp.video_id = v.id
        WHERE v.course_id = c.id AND vp.user_id = $1 AND vp.completed = TRUE
      ) as completed_videos
      FROM courses c 
      JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN users u ON c.created_by = u.id
      WHERE e.user_id = $1
      ORDER BY c.created_at DESC
    `;
    const result = await db.query(query, [userId]);
    
    // Calculate progress percentage
    const coursesWithProgress = result.rows.map(course => {
      const total = parseInt(course.total_videos);
      const completed = parseInt(course.completed_videos);
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { ...course, progress };
    });

    res.json(coursesWithProgress);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAvailableCourses = async (req, res) => {
  try {
    const query = `
      SELECT c.*, u.name as created_by_name 
      FROM courses c 
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id NOT IN (
        SELECT course_id FROM enrollments WHERE user_id = $1
      )
      ORDER BY c.created_at DESC
    `;
    const result = await db.query(query, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.enrollInCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if already enrolled
    const check = await db.query(
      'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [req.user.id, id]
    );
    
    if (check.rows.length > 0) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    await db.query(
      'INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2)',
      [req.user.id, id]
    );

    const course = await db.query('SELECT * FROM courses WHERE id = $1', [id]);
    res.json({ message: 'Enrolled successfully', course: course.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Anyone can view course basic info
    // (Enrollment check removed from here to allow course preview)

    const result = await db.query(
      'SELECT c.*, u.name as created_by_name FROM courses c LEFT JOIN users u ON c.created_by = u.id WHERE c.id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const course = result.rows[0];
    
    // Check if enrolled
    const enrollmentRes = await db.query(
      'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [req.user.id, id]
    );
    course.isEnrolled = enrollmentRes.rows.length > 0;

    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;
    const result = await db.query(
      'INSERT INTO courses (title, description, created_by) VALUES ($1, $2, $3) RETURNING *',
      [title, description, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const result = await db.query(
      'UPDATE courses SET title = COALESCE($1, title), description = COALESCE($2, description) WHERE id = $3 RETURNING *',
      [title, description, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Course not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM courses WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) return res.status(404).json({ error: 'Course not found' });
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Admin-specific stats
    if (req.user.role === 'admin') {
      const [usersCount, coursesCount, enrollmentsCount, trainersCount] = await Promise.all([
        db.query('SELECT COUNT(*) FROM users'),
        db.query('SELECT COUNT(*) FROM courses'),
        db.query('SELECT COUNT(*) FROM enrollments'),
        db.query('SELECT COUNT(*) FROM users WHERE role = $1 AND status = $2', ['trainer', 'active'])
      ]);

      return res.json({
        totalUsers: parseInt(usersCount.rows[0].count),
        totalCourses: parseInt(coursesCount.rows[0].count),
        totalEnrollments: parseInt(enrollmentsCount.rows[0].count),
        totalTrainers: parseInt(trainersCount.rows[0].count),
        isAdmin: true
      });
    }

    // Trainer-specific stats
    if (req.user.role === 'trainer') {
      const [myCoursesCount, totalStudentsCount, totalVideosCount] = await Promise.all([
        db.query('SELECT COUNT(*) FROM courses WHERE created_by = $1', [userId]),
        db.query('SELECT COUNT(DISTINCT user_id) FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE c.created_by = $1', [userId]),
        db.query('SELECT COUNT(*) FROM videos v JOIN courses c ON v.course_id = c.id WHERE c.created_by = $1', [userId])
      ]);

      return res.json({
        totalCourses: parseInt(myCoursesCount.rows[0].count),
        totalStudents: parseInt(totalStudentsCount.rows[0].count),
        totalVideos: parseInt(totalVideosCount.rows[0].count),
        role: 'trainer',
        isAdmin: false
      });
    }

    // Student-specific stats
    // 1. Enrolled Courses Count
    const enrolledCountRes = await db.query(
      'SELECT COUNT(*) FROM enrollments WHERE user_id = $1',
      [userId]
    );
    const enrolledCount = parseInt(enrolledCountRes.rows[0].count);

    // 2. Calculate Progress (Only for videos in currently enrolled courses)
    const progressRes = await db.query(`
      SELECT 
        COUNT(v.id) as total_vids,
        COUNT(vp.video_id) FILTER (WHERE vp.completed = TRUE) as completed_vids
      FROM enrollments e
      JOIN videos v ON e.course_id = v.course_id
      LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = $1
      WHERE e.user_id = $1
    `, [userId]);

    const totalVideos = parseInt(progressRes.rows[0].total_vids || 0);
    const completedLessons = parseInt(progressRes.rows[0].completed_vids || 0);
    
    let avgProgress = 0;
    if (totalVideos > 0) {
      avgProgress = Math.round((completedLessons / totalVideos) * 100);
    }

    // 4. Certificates
    const certificatesRes = await db.query(`
      SELECT COUNT(*) FROM (
        SELECT c.id
        FROM courses c
        JOIN enrollments e ON c.id = e.course_id
        JOIN videos v ON c.id = v.course_id
        LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = $1
        WHERE e.user_id = $1
        GROUP BY c.id
        HAVING COUNT(v.id) = COUNT(vp.video_id) AND COUNT(v.id) > 0
      ) AS completed_courses
    `, [userId]);
    const certificateCount = parseInt(certificatesRes.rows[0].count);

    res.json({
      enrolledCount,
      completedLessons,
      avgProgress: `${avgProgress}%`,
      certificateCount,
      isAdmin: false
    });
  } catch (err) {
    console.error('Stats calculation error:', err.message);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

exports.getMyTrainers = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT DISTINCT u.id, u.name, u.email
      FROM users u
      JOIN courses c ON u.id = c.created_by
      JOIN enrollments e ON c.id = e.course_id
      WHERE e.user_id = $1
    `;
    const result = await db.query(query, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching trainers' });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      (
        SELECT 
          'Lesson Completed' as type,
          v.title as title,
          c.title as subtitle,
          vp.updated_at as timestamp,
          c.id as course_id,
          v.id as video_id
        FROM video_progress vp
        JOIN videos v ON vp.video_id = v.id
        JOIN courses c ON v.course_id = c.id
        WHERE vp.user_id = $1 AND vp.completed = TRUE
      )
      UNION ALL
      (
        SELECT 
          'New Course' as type,
          c.title as title,
          'You just enrolled in this course' as subtitle,
          e.enrolled_at as timestamp,
          c.id as course_id,
          NULL as video_id
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.user_id = $1
      )
      ORDER BY timestamp DESC
      LIMIT 5
    `;
    
    const result = await db.query(query, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Activity fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
};
