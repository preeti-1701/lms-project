const express = require("express");
const router = express.Router();

const {
  createCourse,
  getCourses,
  updateCourse,
  deleteCourse
} = require("../controllers/courseController");

const verifyToken = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

router.post(
  "/",
  verifyToken,
  authorizeRoles("admin", "trainer"),
  createCourse
);

router.get(
  "/",
  verifyToken,
  getCourses
);

router.put(
    "/:id",
    verifyToken,
    authorizeRoles("admin", "trainer"),
    updateCourse
);

router.delete(
    "/:id",
    verifyToken,
    authorizeRoles("admin", "trainer"),
    deleteCourse
);

module.exports = router;