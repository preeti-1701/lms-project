const pool = require('../config/database');

const enrollStudent = async (req, res) => {
  try {
    const { student_id, course_id } = req.body;

    if (!student_id || !course_id) {
      return res.status(400).json({ success: false, message: 'Student ID and Course ID are required' });
    }

    // Check student exists and has student role
    const studentCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND role = $2 AND is_active = TRUE',
      [student_id, 'student']
    );
    if (studentCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found or inactive' });
    }

    // Check course exists
    const courseCheck = await pool.query('SELECT id FROM courses WHERE id = $1 AND is_active = TRUE', [course_id]);
    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const result = await pool.query(
      'INSERT INTO enrollments (student_id, course_id, enrolled_by) VALUES ($1, $2, $3) ON CONFLICT (student_id, course_id) DO NOTHING RETURNING *',
      [student_id, course_id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Student already enrolled in this course' });
    }

    res.status(201).json({ success: true, message: 'Student enrolled successfully', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const unenrollStudent = async (req, res) => {
  try {
    const { student_id, course_id } = req.body;

    await pool.query(
      'DELETE FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [student_id, course_id]
    );

    res.json({ success: true, message: 'Student unenrolled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;

    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.mobile, e.enrolled_at,
         COUNT(wp.id) FILTER (WHERE wp.completed = TRUE) as completed_videos
       FROM enrollments e
       JOIN users u ON e.student_id = u.id
       LEFT JOIN videos v ON v.course_id = e.course_id
       LEFT JOIN watch_progress wp ON wp.video_id = v.id AND wp.student_id = u.id
       WHERE e.course_id = $1
       GROUP BY u.id, u.name, u.email, u.mobile, e.enrolled_at
       ORDER BY e.enrolled_at DESC`,
      [courseId]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const bulkEnroll = async (req, res) => {
  try {
    const { student_ids, course_id } = req.body;

    if (!Array.isArray(student_ids) || student_ids.length === 0 || !course_id) {
      return res.status(400).json({ success: false, message: 'student_ids array and course_id are required' });
    }

    const values = student_ids.map(sid => `('${sid}', '${course_id}', '${req.user.id}')`).join(',');
    await pool.query(
      `INSERT INTO enrollments (student_id, course_id, enrolled_by) VALUES ${values} ON CONFLICT DO NOTHING`
    );

    res.json({ success: true, message: `${student_ids.length} students enrolled successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { enrollStudent, unenrollStudent, getCourseStudents, bulkEnroll };
