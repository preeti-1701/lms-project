const { pool } = require('../config/db');

const createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;
    const created_by = req.user.userId;

    if (!title || !description) {
      return res.status(400).json({ message: 'Course title and description are required' });
    }

    const result = await pool.query(
      'INSERT INTO courses (title, description, created_by) VALUES ($1, $2, $3) RETURNING *',
      [title, description, created_by]
    );

    res.status(201).json({ course: result.rows[0] });
  } catch (error) {
    console.error('Create course error', error);
    res.status(500).json({ message: 'Server error while creating course' });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT courses.id, courses.title, courses.description, users.name as trainer_name
       FROM courses
       JOIN users ON users.id = courses.created_by
       ORDER BY courses.id DESC`
    );
    res.json({ courses: result.rows });
  } catch (error) {
    console.error('Get courses error', error);
    res.status(500).json({ message: 'Server error while fetching courses' });
  }
};

const enrollStudent = async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    if (!userId || !courseId) {
      return res.status(400).json({ message: 'userId and courseId are required' });
    }

    await pool.query('INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, courseId]);
    res.status(201).json({ message: 'Student assigned to course successfully' });
  } catch (error) {
    console.error('Enroll student error', error);
    res.status(500).json({ message: 'Server error while enrolling student' });
  }
};

const getStudentCourses = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query(
      `SELECT courses.id, courses.title, courses.description, users.name AS trainer_name
       FROM enrollments
       JOIN courses ON courses.id = enrollments.course_id
       JOIN users ON users.id = courses.created_by
       WHERE enrollments.user_id = $1`,
      [userId]
    );
    res.json({ courses: result.rows });
  } catch (error) {
    console.error('Student courses error', error);
    res.status(500).json({ message: 'Server error while fetching student courses' });
  }
};

module.exports = { createCourse, getAllCourses, enrollStudent, getStudentCourses };
