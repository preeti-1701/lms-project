const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    console.error('Create user error', error);
    res.status(500).json({ message: 'Server error while creating user' });
  }
};

const listUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role FROM users ORDER BY id DESC');
    res.json({ users: result.rows });
  } catch (error) {
    console.error('List users error', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

module.exports = { createUser, listUsers };
