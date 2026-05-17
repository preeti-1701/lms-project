const express = require("express");

const router = express.Router();

const {
    getMyCourses
} = require("../controllers/studentController");

const authMiddleware = require("../middleware/authMiddleware");

router.get(
    "/my-courses",
    authMiddleware,
    getMyCourses
);

module.exports = router;