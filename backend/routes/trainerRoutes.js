const express = require("express");

const router = express.Router();

const {
    getTrainerCourses
} = require("../controllers/trainerController");

const authMiddleware = require("../middleware/authMiddleware");

router.get(
    "/my-courses",
    authMiddleware,
    getTrainerCourses
);

module.exports = router;