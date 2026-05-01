import express from "express";
import {
  createCourse,
  getCourses,
  assignCourse,
  getAllCourses,
  deleteCourse,
} from "../controllers/course.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", auth, createCourse);
router.get("/", auth, getCourses);
router.get("/all", auth, getAllCourses);
router.post("/assign", auth, assignCourse);
router.delete("/:id", auth, deleteCourse);

export default router;