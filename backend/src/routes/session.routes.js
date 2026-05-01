import express from "express";
import auth from "../middleware/auth.middleware.js";
import role from "../middleware/role.middleware.js";
import { getAllSessions, forceLogout } from "../controllers/session.controller.js";
import prisma from "../config/db.js";

const router = express.Router();

// Admin only - get all sessions
router.get("/", auth, role("admin"), getAllSessions);

// Force logout by sessionId - §3.5
router.put("/:sessionId", auth, role("admin"), forceLogout);

// Force logout all sessions for a user - §3.5
router.delete("/user/:userId", auth, role("admin"), async (req, res) => {
  try {
    // 🔥 Prevent admin from terminating their own sessions
    if (req.params.userId === req.user.userId) {
      return res.status(400).json({ message: "Cannot force logout yourself" });
    }

    await prisma.session.updateMany({
      where: { userId: req.params.userId, isActive: true },
      data: { isActive: false },
    });
    res.json({ message: "All sessions terminated for user" });
  } catch (err) {
    res.status(500).json({ message: "Error terminating sessions" });
  }
});

export default router;