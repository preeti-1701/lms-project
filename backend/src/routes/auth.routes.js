import express from "express";
import auth from "../middleware/auth.middleware.js";
import { register, login } from "../controllers/auth.controller.js";
import prisma from "../config/db.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user" });
  }
});

export default router;