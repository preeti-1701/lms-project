import { useEffect, useState, useCallback } from "react";
import { sampleCourses, type SampleCourse } from "@/components/CourseCard";

export type StoredUser = {
  name: string;
  email: string;
  role: "Admin" | "Trainer" | "Student";
  status: "Active" | "Disabled";
  lastSeen: string;
  ip: string;
};

export type CourseVideo = {
  id: string;
  title: string;
  url: string;
  addedAt: string;
};

export type StoredCourse = SampleCourse & { videos: CourseVideo[]; price?: number };

export function defaultPriceFor(modules: number) {
  return 19 + modules * 8;
}
export function priceFor(course: { price?: number; modules: number }) {
  return course.price ?? defaultPriceFor(course.modules);
}

const USERS_KEY = "lumen_users";
const COURSES_KEY = "lumen_courses";

const defaultUsers: StoredUser[] = [
  { name: "Sarah Chen", email: "sarah@acme.io", role: "Student", status: "Active", lastSeen: "2m ago", ip: "103.21.44.12" },
  { name: "Rahul Verma", email: "rahul@acme.io", role: "Student", status: "Active", lastSeen: "8m ago", ip: "49.36.110.5" },
  { name: "Amy Tran", email: "amy@acme.io", role: "Trainer", status: "Active", lastSeen: "1h ago", ip: "172.58.10.22" },
  { name: "Lin Wei", email: "lin@acme.io", role: "Student", status: "Disabled", lastSeen: "3d ago", ip: "—" },
  { name: "Marco Rossi", email: "marco@acme.io", role: "Admin", status: "Active", lastSeen: "12m ago", ip: "84.20.5.99" },
  { name: "Jade Park", email: "jade@acme.io", role: "Trainer", status: "Active", lastSeen: "5h ago", ip: "59.12.88.40" },
];

const defaultCourses: StoredCourse[] = sampleCourses.map((c) => ({ ...c, videos: [] }));

type Listener = () => void;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  emit();
}

export function getUsers(): StoredUser[] {
  return read(USERS_KEY, defaultUsers);
}
export function setUsers(users: StoredUser[]) {
  write(USERS_KEY, users);
}
export function getCourses(): StoredCourse[] {
  return read(COURSES_KEY, defaultCourses);
}
export function setCourses(courses: StoredCourse[]) {
  write(COURSES_KEY, courses);
}

function useStoreSync() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const l = () => setTick((n) => n + 1);
    listeners.add(l);
    const onStorage = () => l();
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(l);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
}

export function useUsers() {
  useStoreSync();
  const users = getUsers();
  const deleteUser = useCallback((email: string) => {
    setUsers(getUsers().filter((u) => u.email !== email));
  }, []);
  const toggleUser = useCallback((email: string) => {
    setUsers(
      getUsers().map((u) =>
        u.email === email ? { ...u, status: u.status === "Active" ? "Disabled" : "Active" } : u,
      ),
    );
  }, []);
  return { users, deleteUser, toggleUser };
}

export function useCourses() {
  useStoreSync();
  const courses = getCourses();
  const addVideo = useCallback((courseId: string, video: Omit<CourseVideo, "id" | "addedAt">) => {
    const v: CourseVideo = {
      id: `v_${Date.now()}`,
      addedAt: new Date().toISOString(),
      ...video,
    };
    setCourses(
      getCourses().map((c) => (c.id === courseId ? { ...c, videos: [...c.videos, v] } : c)),
    );
  }, []);
  const removeVideo = useCallback((courseId: string, videoId: string) => {
    setCourses(
      getCourses().map((c) =>
        c.id === courseId ? { ...c, videos: c.videos.filter((v) => v.id !== videoId) } : c,
      ),
    );
  }, []);
  const setPrice = useCallback((courseId: string, price: number) => {
    setCourses(
      getCourses().map((c) => (c.id === courseId ? { ...c, price } : c)),
    );
  }, []);
  return { courses, addVideo, removeVideo, setPrice };
}

export function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const parts = u.pathname.split("/");
    const idx = parts.findIndex((p) => p === "embed" || p === "shorts");
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    return null;
  } catch {
    return null;
  }
}
