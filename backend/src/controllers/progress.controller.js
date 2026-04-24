const pool = require('../config/database');

const updateProgress = async (req, res) => {
  try {
    const { video_id, watched_seconds, completed } = req.body;

    if (!video_id) {
      return res.status(400).json({ success: false, message: 'Video ID is required' });
    }

    await pool.query(
      `INSERT INTO watch_progress (student_id, video_id, watched_seconds, completed, last_watched_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (student_id, video_id)
       DO UPDATE SET
         watched_seconds = GREATEST(watch_progress.watched_seconds, EXCLUDED.watched_seconds),
         completed = COALESCE(EXCLUDED.completed, watch_progress.completed),
         last_watched_at = NOW()`,
      [req.user.id, video_id, watched_seconds || 0, completed || false]
    );

    res.json({ success: true, message: 'Progress updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    const result = await pool.query(
      `SELECT v.id as video_id, v.title, wp.watched_seconds, wp.completed, wp.last_watched_at
       FROM videos v
       LEFT JOIN watch_progress wp ON wp.video_id = v.id AND wp.student_id = $1
       WHERE v.course_id = $2
       ORDER BY v.order_index ASC`,
      [req.user.id, courseId]
    );

    const total = result.rows.length;
    const completed = result.rows.filter(r => r.completed).length;

    res.json({
      success: true,
      data: {
        videos: result.rows,
        summary: {
          total_videos: total,
          completed_videos: completed,
          progress_percent: total > 0 ? Math.round((completed / total) * 100) : 0,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { updateProgress, getCourseProgress };
