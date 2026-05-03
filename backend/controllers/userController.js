const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, is_active, last_login, created_at FROM users WHERE is_active = 1 ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields required' });
    }
    const validRoles = ['admin', 'trainer', 'student'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);
    const id = uuidv4();
    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, $5, 1)`,
      [id, name, email.toLowerCase(), password_hash, role]
    );
    res.status(201).json({ id, name, email, role, is_active: 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, is_active } = req.body;
    await pool.query(
      `UPDATE users SET name=$1, email=$2, role=$3, is_active=$4, updated_at=CURRENT_TIMESTAMP
       WHERE id=$5`,
      [name, email.toLowerCase(), role, is_active ? 1 : 0, id]
    );
    res.json({ id, name, email, role, is_active });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.disableUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Hard delete from all related tables
    await pool.query('DELETE FROM sessions WHERE user_id = $1', [id]);
    await pool.query('DELETE FROM user_courses WHERE user_id = $1', [id]);
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    
    res.json({ message: 'User permanently deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.assignCourse = async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    const existing = await pool.query(
      'SELECT id FROM user_courses WHERE user_id=$1 AND course_id=$2',
      [userId, courseId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Course already assigned' });
    }
    const id = uuidv4();
    await pool.query('INSERT INTO user_courses (id, user_id, course_id) VALUES ($1, $2, $3)', [id, userId, courseId]);
    res.json({ message: 'Course assigned successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeCourse = async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    await pool.query('DELETE FROM user_courses WHERE user_id=$1 AND course_id=$2', [userId, courseId]);
    res.json({ message: 'Course removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserCourses = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT c.id, c.title, c.description, c.created_at
       FROM courses c JOIN user_courses uc ON c.id = uc.course_id
       WHERE uc.user_id = $1`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
