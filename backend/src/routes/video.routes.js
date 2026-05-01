import express from "express";
import auth from "../middleware/auth.middleware.js";

// 🔥 IMPORT BOTH
import { addVideo, deleteVideo } from "../controllers/video.controller.js";

const router = express.Router();

// ✅ ADD VIDEO
router.post("/", auth, addVideo);

// ✅ DELETE VIDEO
router.delete("/:id", auth, deleteVideo);

export default router;