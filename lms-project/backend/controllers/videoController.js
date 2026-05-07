const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const extractYouTubeId = (url) => {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

exports.addVideo = async (req, res) => {
  try {
    const { course_id, title, youtube_url, description, order_index } = req.body;
    if (!course_id || !title || !youtube_url) {
      return res.status(400).json({ message: 'course_id, title, and youtube_url are required' });
    }
    const youtube_id = extractYouTubeId(youtube_url);
    if (!youtube_id) return res.status(400).json({ message: 'Invalid YouTube URL' });

    const id = uuidv4();
    await pool.query(
      `INSERT INTO videos (id, course_id, title, youtube_url, youtube_id, description, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, course_id, title, youtube_url, youtube_id, description, order_index || 0]
    );
    res.status(201).json({ id, course_id, title, youtube_url, youtube_id, description, order_index });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, youtube_url, description, order_index } = req.body;
    const youtube_id = extractYouTubeId(youtube_url);
    if (!youtube_id) return res.status(400).json({ message: 'Invalid YouTube URL' });

    await pool.query(
      `UPDATE videos SET title=$1, youtube_url=$2, youtube_id=$3, description=$4, order_index=$5, updated_at=CURRENT_TIMESTAMP
       WHERE id=$6`,
      [title, youtube_url, youtube_id, description, order_index, id]
    );
    res.json({ id, title, youtube_url, youtube_id, description, order_index });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM videos WHERE id=$1', [id]);
    res.json({ message: 'Video deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
