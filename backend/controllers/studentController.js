const pool = require("../config/db");

const getMyCourses = async (req, res) => {

    try {

        // logged-in student id
        const studentId = req.user.id;

        // fetch enrolled courses
        const result = await pool.query(

            `SELECT courses.*
             
             FROM enrollments

             JOIN courses
             ON enrollments.course_id = courses.id

             WHERE enrollments.student_id = $1`,

            [studentId]
        );

        res.status(200).json({
            courses: result.rows
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    getMyCourses
};