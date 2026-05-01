import prisma from "../config/db.js";


// 👑 ADMIN → ALL ENROLLMENTS (with per-student progress)
export const getEnrollments = async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        user: true,
        course: {
          include: {
            videos: {
              include: {
                progress: true, // include all progress rows per video
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter each video's progress to only the enrolled user's records
    const result = enrollments.map((e) => ({
      ...e,
      course: {
        ...e.course,
        videos: e.course.videos.map((v) => ({
          ...v,
          progress: v.progress.filter((p) => p.userId === e.userId),
        })),
      },
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching enrollments" });
  }
};


// 👨‍🎓 STUDENT → ONLY THEIR COURSES
export const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: req.user.userId,
      },
      include: {
        course: {
          include: {
            videos: {
              include: {
                progress: {
                  where: { userId: req.user.userId },
                },
              },
            },
          },
        },
      },
    });

    res.json(enrollments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching user enrollments" });
  }
};