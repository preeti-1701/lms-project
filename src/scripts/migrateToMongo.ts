import mongoose from "mongoose";
import { User } from "../models/User";
import { Course } from "../models/Course";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Default data extracted from the original store.ts
const defaultUsers = [
  { name: "Sarah Chen", email: "sarah@acme.io", role: "Student", status: "Active", lastSeen: "2m ago", ip: "103.21.44.12" },
  { name: "Rahul Verma", email: "rahul@acme.io", role: "Student", status: "Active", lastSeen: "8m ago", ip: "49.36.110.5" },
  { name: "Amy Tran", email: "amy@acme.io", role: "Trainer", status: "Active", lastSeen: "1h ago", ip: "172.58.10.22" },
  { name: "Lin Wei", email: "lin@acme.io", role: "Student", status: "Disabled", lastSeen: "3d ago", ip: "—" },
  { name: "Marco Rossi", email: "marco@acme.io", role: "Admin", status: "Active", lastSeen: "12m ago", ip: "84.20.5.99" },
  { name: "Jade Park", email: "jade@acme.io", role: "Trainer", status: "Active", lastSeen: "5h ago", ip: "59.12.88.40" },
];

const sampleCourses = [
  { id: "react-foundations", title: "React Foundations", trainer: "Amy Tran", modules: 8, hours: "6h 20m", progress: 72, hue: 280 },
  { id: "advanced-typescript", title: "Advanced TypeScript", trainer: "Jade Park", modules: 10, hours: "8h 05m", progress: 38, hue: 220 },
  { id: "design-systems", title: "Design Systems in Practice", trainer: "Amy Tran", modules: 6, hours: "4h 45m", progress: 100, hue: 320 },
  { id: "node-apis", title: "Production Node.js APIs", trainer: "Marco Rossi", modules: 12, hours: "10h 12m", progress: 12, hue: 200 },
  { id: "leadership-101", title: "Engineering Leadership 101", trainer: "Lin Wei", modules: 5, hours: "3h 30m", progress: 0, hue: 260 },
  { id: "secure-coding", title: "Secure Coding Essentials", trainer: "Marco Rossi", modules: 9, hours: "7h 10m", progress: 56, hue: 300 },
];

const defaultCourses = sampleCourses.map((c) => ({ ...c, videos: [] }));

async function migrate() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error("Please define the MONGODB_URI environment variable inside .env");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  // Check if users already exist
  const existingUsers = await User.countDocuments();
  if (existingUsers === 0) {
    console.log("Seeding Users...");
    await User.insertMany(defaultUsers);
    console.log("Users seeded");
  } else {
    console.log("Users already exist, skipping...");
  }

  // Check if courses already exist
  const existingCourses = await Course.countDocuments();
  if (existingCourses === 0) {
    console.log("Seeding Courses...");
    await Course.insertMany(defaultCourses);
    console.log("Courses seeded");
  } else {
    console.log("Courses already exist, skipping...");
  }

  console.log("Migration complete!");
  mongoose.connection.close();
}

migrate().catch(console.error);
