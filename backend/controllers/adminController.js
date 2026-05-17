const pool = require("../config/db");

// get all users
const getAllUsers = async (req, res) => {

  try {

    const users = await pool.query(
      "SELECT id, name, email, role FROM users"
    );

    res.status(200).json({
      users: users.rows,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// delete user
const deleteUser = async (req, res) => {

  try {

    const { id } = req.params;

    await pool.query(
      "DELETE FROM users WHERE id = $1",
      [id]
    );

    res.status(200).json({
      message: "User deleted successfully",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
};