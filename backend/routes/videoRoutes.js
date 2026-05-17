const express = require("express");

const router = express.Router();

const { addVideo,
    getVideosByCourse } = require("../controllers/videoController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, addVideo);
router.get(
    "/:courseId",
    authMiddleware,
    getVideosByCourse
);

module.exports = router;