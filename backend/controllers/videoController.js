const db = require('../config/db');

exports.getVideosByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if student is enrolled for full content access
    let isEnrolled = true;
    if (req.user.role === 'student') {
      const checkEnrollment = await db.query(
        'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2',
        [req.user.id, courseId]
      );
      isEnrolled = checkEnrollment.rows.length > 0;
    }

    // Return videos, but hide URLs if not enrolled
    const result = await db.query(
      'SELECT id, course_id, title, order_index ' + 
      (isEnrolled ? ', youtube_url ' : '') + 
      'FROM videos WHERE course_id = $1 ORDER BY order_index ASC',
      [courseId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.addVideo = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { youtube_url, title, order_index } = req.body;

    const result = await db.query(
      'INSERT INTO videos (course_id, youtube_url, title, order_index) VALUES ($1, $2, $3, $4) RETURNING *',
      [courseId, youtube_url, title, order_index || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { youtube_url, title, order_index } = req.body;

    const result = await db.query(
      'UPDATE videos SET youtube_url = COALESCE($1, youtube_url), title = COALESCE($2, title), order_index = COALESCE($3, order_index) WHERE id = $4 RETURNING *',
      [youtube_url, title, order_index, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Video not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM videos WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Video not found' });
    res.json({ message: 'Video deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.toggleVideoProgress = async (req, res) => {
  try {
    const { id } = req.params; // videoId
    const { completed } = req.body;
    const userId = req.user.id;

    // Upsert progress
    await db.query(`
      INSERT INTO video_progress (user_id, video_id, completed)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, video_id)
      DO UPDATE SET completed = $3
    `, [userId, id, completed]);

    res.json({ message: 'Progress updated', videoId: id, completed });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getVideoProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'SELECT video_id, completed FROM video_progress WHERE user_id = $1 AND video_id IN (SELECT id FROM videos WHERE course_id = $2)',
      [userId, courseId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};
