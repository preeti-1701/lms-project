import prisma from "../config/db.js";

export const addVideo = async (req, res) => {
  try {
    const { youtubeUrl, courseId } = req.body;

    const video = await prisma.video.create({
      data: { youtubeUrl, courseId },
    });

    res.json(video);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding video" });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    // delete progress first
    await prisma.progress.deleteMany({
      where: { videoId: id },
    });

    // delete video
    await prisma.video.delete({
      where: { id },
    });

    res.json({ message: "Video deleted" });
  } catch (err) {
    // P2025 = record not found — already deleted, treat as success
    if (err.code === "P2025") {
      return res.json({ message: "Video already deleted" });
    }
    console.error(err);
    res.status(500).json({ message: "Error deleting video" });
  }
};