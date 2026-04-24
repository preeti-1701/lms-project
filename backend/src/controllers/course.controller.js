const pool = require('../config/database');

const getAllCourses = async (req, res) => {
  try {
    let query;
    let params;

    if (req.user.role === 'student') {
      query = `
        SELECT c.*, u.name as created_by_name,
          COUNT(DISTINCT v.id) as video_count,
          COUNT(DISTINCT e.id) as student_count
        FROM courses c
        JOIN enrollments e ON e.course_id = c.id AND e.student_id = $1
        LEFT JOIN users u ON c.created_by = u.id
        LEFT JOIN videos v ON v.course_id = c.id
        WHERE c.is_active = TRUE
        GROUP BY c.id, u.name
        ORDER BY c.created_at DESC
      `;
      params = [req.user.id];
    } else {
      query = `
        SELECT c.*, u.name as created_by_name,
          COUNT(DISTINCT v.id) as video_count,
          COUNT(DISTINCT e.id) as student_count
        FROM courses c
        LEFT JOIN users u ON c.created_by = u.id
        LEFT JOIN videos v ON v.course_id = c.id
        LEFT JOIN enrollments e ON e.course_id = c.id
        GROUP BY c.id, u.name
        ORDER BY c.created_at DESC
      `;
      params = [];
    }

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role === 'student') {
      const enrolled = await pool.query(
        'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
        [req.user.id, id]
      );
      if (enrolled.rows.length === 0) {
        return res.status(403).json({ success: false, message: 'You are not enrolled in this course' });
      }
    }

    const courseResult = await pool.query(
      'SELECT c.*, u.name as created_by_name FROM courses c LEFT JOIN users u ON c.created_by = u.id WHERE c.id = $1',
      [id]
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const videosResult = await pool.query(
      'SELECT v.*, u.name as created_by_name FROM videos v LEFT JOIN users u ON v.created_by = u.id WHERE v.course_id = $1 ORDER BY v.order_index ASC',
      [id]
    );

    // For students, mask actual YouTube URLs - only return video IDs
    let videos = videosResult.rows;
    if (req.user.role === 'student') {
      videos = videos.map(v => ({
        ...v,
        youtube_url: undefined, // Don't expose direct URL
      }));
    }

    res.json({
      success: true,
      data: {
        ...courseResult.rows[0],
        videos,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const result = await pool.query(
      'INSERT INTO courses (title, description, created_by) VALUES ($1, $2, $3) RETURNING *',
      [title, description || null, req.user.id]
    );

    res.status(201).json({ success: true, message: 'Course created successfully', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, is_active } = req.body;

    const result = await pool.query(
      'UPDATE courses SET title = COALESCE($1, title), description = COALESCE($2, description), is_active = COALESCE($3, is_active), updated_at = NOW() WHERE id = $4 RETURNING *',
      [title, description, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.json({ success: true, message: 'Course updated', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM courses WHERE id = $1', [id]);
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse };
