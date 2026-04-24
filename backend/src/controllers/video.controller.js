const pool = require('../config/database');

// Extract YouTube video ID from various URL formats
const extractYouTubeId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const addVideo = async (req, res) => {
  try {
    const { course_id, title, youtube_url, description, order_index } = req.body;

    if (!course_id || !title || !youtube_url) {
      return res.status(400).json({ success: false, message: 'Course ID, title, and YouTube URL are required' });
    }

    const videoId = extractYouTubeId(youtube_url);
    if (!videoId) {
      return res.status(400).json({ success: false, message: 'Invalid YouTube URL' });
    }

    // Check course exists
    const courseCheck = await pool.query('SELECT id FROM courses WHERE id = $1', [course_id]);
    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const result = await pool.query(
      'INSERT INTO videos (course_id, title, youtube_url, youtube_video_id, description, order_index, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [course_id, title, youtube_url, videoId, description || null, order_index || 0, req.user.id]
    );

    res.status(201).json({ success: true, message: 'Video added successfully', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, youtube_url, description, order_index } = req.body;

    let videoId = undefined;
    if (youtube_url) {
      videoId = extractYouTubeId(youtube_url);
      if (!videoId) {
        return res.status(400).json({ success: false, message: 'Invalid YouTube URL' });
      }
    }

    const result = await pool.query(
      `UPDATE videos SET
        title = COALESCE($1, title),
        youtube_url = COALESCE($2, youtube_url),
        youtube_video_id = COALESCE($3, youtube_video_id),
        description = COALESCE($4, description),
        order_index = COALESCE($5, order_index),
        updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [title, youtube_url || null, videoId || null, description, order_index, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    res.json({ success: true, message: 'Video updated', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM videos WHERE id = $1', [id]);
    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Secure video token for student playback
const getVideoToken = async (req, res) => {
  try {
    const { id } = req.params;

    // Check student is enrolled in the course for this video
    const result = await pool.query(
      `SELECT v.youtube_video_id FROM videos v
       JOIN enrollments e ON e.course_id = v.course_id AND e.student_id = $1
       WHERE v.id = $2`,
      [req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied to this video' });
    }

    // Log access
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'VIDEO_ACCESS', 'video', id, req.ip]
    );

    res.json({
      success: true,
      data: {
        videoId: result.rows[0].youtube_video_id,
        watermark: req.user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { addVideo, updateVideo, deleteVideo, getVideoToken };
