const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

exports.getAllCourses = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.name AS creator_name,
       (SELECT COUNT(*) FROM videos WHERE course_id = c.id) AS video_count
       FROM courses c LEFT JOIN users u ON c.created_by = u.id
       ORDER BY c.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStudentCourses = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.title, c.description, c.created_at,
       (SELECT COUNT(*) FROM videos WHERE course_id = c.id) AS video_count
       FROM courses c JOIN user_courses uc ON c.id = uc.course_id
       WHERE uc.user_id = $1`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role === 'student') {
      const access = await pool.query(
        'SELECT id FROM user_courses WHERE user_id=$1 AND course_id=$2',
        [req.user.id, id]
      );
      if (access.rows.length === 0) {
        return res.status(403).json({ message: 'Access denied to this course' });
      }
    }

    const course = await pool.query(
      `SELECT c.*, u.name AS creator_name FROM courses c
       LEFT JOIN users u ON c.created_by = u.id WHERE c.id = $1`,
      [id]
    );
    if (course.rows.length === 0) return res.status(404).json({ message: 'Course not found' });

    const videos = await pool.query(
      'SELECT * FROM videos WHERE course_id=$1 ORDER BY order_index ASC',
      [id]
    );
    res.json({ ...course.rows[0], videos: videos.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    const id = uuidv4();
    await pool.query(
      `INSERT INTO courses (id, title, description, created_by) VALUES ($1, $2, $3, $4)`,
      [id, title, description, req.user.id]
    );
    res.status(201).json({ id, title, description, created_by: req.user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    await pool.query(
      `UPDATE courses SET title=$1, description=$2, updated_at=CURRENT_TIMESTAMP WHERE id=$3`,
      [title, description, id]
    );
    res.json({ id, title, description });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM courses WHERE id=$1', [id]);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
