import prisma from "../config/db.js";

// ✅ SAVE PROGRESS
export const saveProgress = async (req, res) => {
  const { videoId, currentTime, watched } = req.body;
  const userId = req.user.userId;

  try {
    const progress = await prisma.progress.upsert({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
      update: {
        lastTime: currentTime,
        watched,
      },
      create: {
        userId,
        videoId,
        lastTime: currentTime,
        watched,
      },
    });

    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: "Error saving progress" });
  }
};

// ✅ GET PROGRESS
export const getProgress = async (req, res) => {
  const userId = req.user.userId;

  const data = await prisma.progress.findMany({
    where: { userId },
  });

  res.json(data);
};