import { createServerFn } from "@tanstack/react-start";
import { connectToDatabase } from "../lib/db";
import { User } from "../models/User";
import { Course } from "../models/Course";

export const fetchUsers = createServerFn({ method: "GET" }).handler(async () => {
  await connectToDatabase();
  const users = await User.find({}).lean();
  return users.map((u: any) => ({
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    lastSeen: u.lastSeen,
    ip: u.ip,
  }));
});

export const deleteUser = createServerFn({ method: "POST" })
  .handler(async (ctx: { data: string }) => {
    await connectToDatabase();
    await User.deleteOne({ email: ctx.data });
    return { success: true };
  });

export const toggleUser = createServerFn({ method: "POST" })
  .handler(async (ctx: { data: string }) => {
    await connectToDatabase();
    const user = await User.findOne({ email: ctx.data });
    if (user) {
      user.status = user.status === "Active" ? "Disabled" : "Active";
      await user.save();
    }
    return { success: true };
  });

export const fetchCourses = createServerFn({ method: "GET" }).handler(async () => {
  await connectToDatabase();
  const courses = await Course.find({}).lean();
  return courses.map((c: any) => ({
    id: c.id,
    title: c.title,
    trainer: c.trainer,
    modules: c.modules,
    hours: c.hours,
    progress: c.progress,
    hue: c.hue,
    price: c.price,
    videos: c.videos.map((v: any) => ({
      id: v.id,
      title: v.title,
      url: v.url,
      addedAt: v.addedAt,
    })),
  }));
});

export const addCourseVideo = createServerFn({ method: "POST" })
  .handler(async (ctx: { data: { courseId: string; title: string; url: string } }) => {
    await connectToDatabase();
    const { courseId, title, url } = ctx.data;
    const course = await Course.findOne({ id: courseId });
    if (course) {
      course.videos.push({
        id: `v_${Date.now()}`,
        addedAt: new Date().toISOString(),
        title,
        url,
      });
      await course.save();
    }
    return { success: true };
  });

export const removeCourseVideo = createServerFn({ method: "POST" })
  .handler(async (ctx: { data: { courseId: string; videoId: string } }) => {
    await connectToDatabase();
    const { courseId, videoId } = ctx.data;
    const course = await Course.findOne({ id: courseId });
    if (course) {
      course.videos = course.videos.filter((v: any) => v.id !== videoId);
      await course.save();
    }
    return { success: true };
  });

export const setCoursePrice = createServerFn({ method: "POST" })
  .handler(async (ctx: { data: { courseId: string; price: number } }) => {
    await connectToDatabase();
    const { courseId, price } = ctx.data;
    await Course.updateOne({ id: courseId }, { $set: { price } });
    return { success: true };
  });
