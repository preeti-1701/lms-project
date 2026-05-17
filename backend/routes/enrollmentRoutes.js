const express = require("express");

const router = express.Router();

const {
    enrollCourse
} = require("../controllers/enrollmentController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, enrollCourse);

module.exports = router;