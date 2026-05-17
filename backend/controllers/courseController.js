const pool = require("../config/db");

const createCourse = async (req, res) => {

  try {

    const { title, description } = req.body;

    // Logged-in trainer/admin
    const trainerId = req.user.id;

    // Insert course
    const newCourse = await pool.query(

      `INSERT INTO courses
      (title, description, trainer_id)
      
      VALUES ($1, $2, $3)
      
      RETURNING *`,

      [title, description, trainerId]
    );

    res.status(201).json({
      message: "Course created successfully",
      course: newCourse.rows[0]
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};

const getCourses = async (req, res) => {

  try {

    const courses = await pool.query(
      "SELECT * FROM courses ORDER BY id DESC"
    );

    res.status(200).json({
      courses: courses.rows
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};

const updateCourse = async (req, res) => {

    try {

        const { id } = req.params;

        const { title, description } = req.body;

        // find course
        const courseResult = await pool.query(
            "SELECT * FROM courses WHERE id = $1",
            [id]
        );

        // check course exists
        if (courseResult.rows.length === 0) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        const course = courseResult.rows[0];

        // trainer ownership check
        if (
            req.user.role !== "admin" &&
            course.trainer_id !== req.user.id
        ) {
            return res.status(403).json({
                message: "You can update only your own courses"
            });
        }

        // update course
        const updatedCourse = await pool.query(

            `UPDATE courses

             SET title = $1,
                 description = $2

             WHERE id = $3

             RETURNING *`,

            [title, description, id]
        );

        res.status(200).json({
            message: "Course updated successfully",
            course: updatedCourse.rows[0]
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const deleteCourse = async (req, res) => {

    try {

        const { id } = req.params;

        // find course
        const courseResult = await pool.query(
            "SELECT * FROM courses WHERE id = $1",
            [id]
        );

        // check course exists
        if (courseResult.rows.length === 0) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        const course = courseResult.rows[0];

        // ownership check
        if (
            req.user.role !== "admin" &&
            course.trainer_id !== req.user.id
        ) {
            return res.status(403).json({
                message: "You can delete only your own courses"
            });
        }

        // delete course
        await pool.query(
            "DELETE FROM courses WHERE id = $1",
            [id]
        );

        res.status(200).json({
            message: "Course deleted successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
  createCourse,
  getCourses,
  updateCourse,
  deleteCourse
};