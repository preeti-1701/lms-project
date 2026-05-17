const pool = require("../config/db");

const getTrainerCourses = async (req, res) => {

    try {

        // logged-in trainer id
        const trainerId = req.user.id;

        // fetch trainer-created courses
        const result = await pool.query(

            `SELECT *
             
             FROM courses

             WHERE trainer_id = $1

             ORDER BY id DESC`,

            [trainerId]
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
    getTrainerCourses
};