import prisma from "../config/db.js";

// CREATE COURSE
export const createCourse = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const course = await prisma.course.create({
      data: {
        title,
        createdBy: req.user.userId,
      },
    });

    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating course" });
  }
};

// GET COURSES (ROLE BASED)
export const getCourses = async (req, res) => {
  try {
    let courses = [];

    // ADMIN → all courses
    if (req.user.role === "admin") {
      courses = await prisma.course.findMany({
        include: { videos: true },
        orderBy: { createdAt: "desc" },
      });
    }

    // TRAINER → only their courses
    else if (req.user.role === "trainer") {
      courses = await prisma.course.findMany({
        where: { createdBy: req.user.userId },
        include: { videos: true },
        orderBy: { createdAt: "desc" },
      });
    }

    // STUDENT → only assigned/enrolled courses (fixed: removed duplicate block)
    else if (req.user.role === "student") {
      const enrollments = await prisma.enrollment.findMany({
        where: {
          userId: req.user.userId,
        },
        include: {
          course: {
            include: {
              videos: true,
            },
          },
        },
      });

      courses = enrollments.map((e) => e.course);
    }

    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching courses" });
  }
};

// GET ALL COURSES (ADMIN + TRAINER only)
export const getAllCourses = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "trainer") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Trainers see only their own; admins see all
    const where = req.user.role === "trainer"
      ? { createdBy: req.user.userId }
      : {};

    const courses = await prisma.course.findMany({
      where,
      include: { videos: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching all courses" });
  }
};

// DELETE COURSE (safe cascade delete)
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // delete progress first
    await prisma.progress.deleteMany({
      where: {
        video: {
          courseId: id,
        },
      },
    });

    // delete videos
    await prisma.video.deleteMany({
      where: { courseId: id },
    });

    // delete enrollments
    await prisma.enrollment.deleteMany({
      where: { courseId: id },
    });

    // delete course
    await prisma.course.delete({
      where: { id },
    });

    res.json({ message: "Course deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting course" });
  }
};

// ASSIGN COURSE (creates enrollment)
export const assignCourse = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
      return res.status(400).json({ message: "userId and courseId required" });
    }

    // prevent duplicate enrollment
    const exists = await prisma.enrollment.findFirst({
      where: { userId, courseId },
    });

    if (exists) {
      return res.status(400).json({ message: "Course already assigned to this student" });
    }

    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId },
    });

    res.json(enrollment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error assigning course" });
  }
};
