import prisma from "../config/db.js";

export const getAllSessions = async (req, res) => {
    try {
      const sessions = await prisma.session.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
  
      res.json(sessions);
    } catch (err) {
      console.error(err); // 🔥 print real error
      res.status(500).json({ message: "Error fetching sessions" });
    }
  };

export const forceLogout = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // 🔥 Prevent admin from terminating their own session
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.userId === req.user.userId) {
      return res.status(400).json({ message: "Cannot terminate your own session" });
    }

    await prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    });

    res.json({ message: "User logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error logging out user" });
  }
};