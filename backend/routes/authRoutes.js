const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser
} = require("../controllers/authController");

const verifyToken = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/profile", verifyToken, (req, res) => {

  res.json({
    message: "Protected profile accessed",
    user: req.user
  });

});

router.get(
  "/admin-dashboard",
  verifyToken,
  authorizeRoles("admin"),

  (req, res) => {

    res.json({
      message: "Welcome Admin"
    });

  }
);

router.get(
  "/trainer-dashboard",
  verifyToken,
  authorizeRoles("trainer"),

  (req, res) => {

    res.json({
      message: "Welcome Trainer"
    });

  }
);

router.get(
  "/student-dashboard",
  verifyToken,
  authorizeRoles("student"),

  (req, res) => {

    res.json({
      message: "Welcome Student"
    });

  }
);

module.exports = router;