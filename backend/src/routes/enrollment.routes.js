import express from "express";
import auth from "../middleware/auth.middleware.js";

import {
  getEnrollments,
  getMyEnrollments,
} from "../controllers/enrollment.controller.js";

const router = express.Router();

// 👑 ADMIN
router.get("/", auth, getEnrollments);

// 👨‍🎓 STUDENT
router.get("/me", auth, getMyEnrollments);

export default router;