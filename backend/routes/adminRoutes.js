const express = require("express");

const router = express.Router();

const {
  getAllUsers,
  deleteUser,
} = require("../controllers/adminController");

const authMiddleware = require(
  "../middleware/authMiddleware"
);

// admin only middleware
const adminOnly = (req, res, next) => {

  if (req.user.role !== "admin") {

    return res.status(403).json({
      message: "Access denied",
    });
  }

  next();
};

// routes
router.get(
  "/users",
  authMiddleware,
  adminOnly,
  getAllUsers
);

router.delete(
  "/users/:id",
  authMiddleware,
  adminOnly,
  deleteUser
);

module.exports = router;