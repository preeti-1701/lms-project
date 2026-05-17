const pool = require("../config/db");

const enrollCourse = async (req, res) => {
    try {

        const { course_id } = req.body;

        // only students can enroll
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can enroll"
            });
        }

        const result = await pool.query(
            `INSERT INTO enrollments (student_id, course_id)
             VALUES ($1, $2)
             RETURNING *`,
            [req.user.id, course_id]
        );

        res.status(201).json({
            message: "Enrollment successful",
            enrollment: result.rows[0]
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = { enrollCourse };