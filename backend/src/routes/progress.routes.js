import express from "express";
import auth from "../middleware/auth.middleware.js";
import {
  saveProgress,
  getProgress,
} from "../controllers/progress.controller.js";

const router = express.Router();

router.post("/", auth, saveProgress);
router.get("/", auth, getProgress);

export default router;