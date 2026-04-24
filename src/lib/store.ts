import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sampleCourses, type SampleCourse } from "@/components/CourseCard";
import { 
  fetchUsers, 
  deleteUser as serverDeleteUser, 
  toggleUser as serverToggleUser,
  fetchCourses,
  addCourseVideo,
  removeCourseVideo,
  setCoursePrice
} from "../server/db";

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

export function useUsers() {
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetchUsers(),
  });

  const deleteMutation = useMutation({
    mutationFn: (email: string) => serverDeleteUser({ data: email }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const toggleMutation = useMutation({
    mutationFn: (email: string) => serverToggleUser({ data: email }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  return {
    users,
    deleteUser: (email: string) => deleteMutation.mutate(email),
    toggleUser: (email: string) => toggleMutation.mutate(email),
  };
}

export function useCourses() {
  const queryClient = useQueryClient();

  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: () => fetchCourses(),
  });

  const addVideoMutation = useMutation({
    mutationFn: (data: { courseId: string; title: string; url: string }) => addCourseVideo({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });

  const removeVideoMutation = useMutation({
    mutationFn: (data: { courseId: string; videoId: string }) => removeCourseVideo({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });

  const setPriceMutation = useMutation({
    mutationFn: (data: { courseId: string; price: number }) => setCoursePrice({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });

  return {
    courses,
    addVideo: (courseId: string, video: Omit<CourseVideo, "id" | "addedAt">) => 
      addVideoMutation.mutate({ courseId, title: video.title, url: video.url }),
    removeVideo: (courseId: string, videoId: string) => 
      removeVideoMutation.mutate({ courseId, videoId }),
    setPrice: (courseId: string, price: number) => 
      setPriceMutation.mutate({ courseId, price }),
  };
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
