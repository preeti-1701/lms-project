const pool = require("../config/db");

const addVideo = async (req, res) => {
    try {
        const { course_id, youtube_link } = req.body;

        // only admin or trainer
        if (
            req.user.role !== "admin" &&
            req.user.role !== "trainer"
        ) {
            return res.status(403).json({
                message: "Only admin or trainer can add videos"
            });
        }

        const result = await pool.query(
            `INSERT INTO videos (course_id, youtube_link)
             VALUES ($1, $2)
             RETURNING *`,
            [course_id, youtube_link]
        );

        res.status(201).json({
            message: "Video added successfully",
            video: result.rows[0]
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

const getVideosByCourse = async (req, res) => {
    try {

        const { courseId } = req.params;

        // admin and trainer can access directly
        if (
            req.user.role === "admin" ||
            req.user.role === "trainer"
        ) {

            const videos = await pool.query(
                "SELECT * FROM videos WHERE course_id = $1",
                [courseId]
            );

            return res.status(200).json({
                videos: videos.rows
            });
        }

        // check student enrollment
        const enrollment = await pool.query(
            `SELECT * FROM enrollments
             WHERE student_id = $1
             AND course_id = $2`,
            [req.user.id, courseId]
        );

        if (enrollment.rows.length === 0) {
            return res.status(403).json({
                message: "You are not enrolled in this course"
            });
        }

        // fetch videos
        const videos = await pool.query(
            "SELECT * FROM videos WHERE course_id = $1",
            [courseId]
        );

        res.status(200).json({
            videos: videos.rows
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = { addVideo,
    getVideosByCourse
 };