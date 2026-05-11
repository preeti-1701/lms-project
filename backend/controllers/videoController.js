const { pool } = require('../config/db');

const addVideo = async (req, res) => {
  try {
    const { courseId, youtubeLink } = req.body;
    if (!courseId || !youtubeLink) {
      return res.status(400).json({ message: 'Course ID and YouTube link are required' });
    }

    const result = await pool.query(
      'INSERT INTO videos (course_id, youtube_link) VALUES ($1, $2) RETURNING *',
      [courseId, youtubeLink]
    );

    res.status(201).json({ video: result.rows[0] });
  } catch (error) {
    console.error('Add video error', error);
    res.status(500).json({ message: 'Server error while adding video' });
  }
};

const getVideosByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await pool.query('SELECT id, course_id, youtube_link FROM videos WHERE course_id = $1 ORDER BY id', [courseId]);
    res.json({ videos: result.rows });
  } catch (error) {
    console.error('Get videos error', error);
    res.status(500).json({ message: 'Server error while fetching videos' });
  }
};

module.exports = { addVideo, getVideosByCourse };
