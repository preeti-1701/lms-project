import express from "express";
import prisma from "../config/db.js";
import auth from "../middleware/auth.middleware.js";
import role from "../middleware/role.middleware.js";
import bcrypt from "bcrypt";

const router = express.Router();

// GET all users (admin + trainer)
router.get("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "trainer") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// POST create user (admin only)
router.post("/", auth, role("admin"), async (req, res) => {
  try {
    const { name, email, password, role: newRole } = req.body;

    if (!name || !email || !password || !newRole) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: newRole, isActive: true },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error creating user" });
  }
});

// PATCH edit user (admin only)
router.patch("/:id", auth, role("admin"), async (req, res) => {
  try {
    const { name, email, role: newRole } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, email, role: newRole },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating user" });
  }
});

// PATCH toggle user active/disabled (admin only)
router.patch("/:id/toggle", auth, role("admin"), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !user.isActive },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    if (!updated.isActive) {
      await prisma.session.updateMany({
        where: { userId: req.params.id, isActive: true },
        data: { isActive: false },
      });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error toggling user status" });
  }
});

// POST change password (self)
router.post("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error changing password" });
  }
});

export default router;