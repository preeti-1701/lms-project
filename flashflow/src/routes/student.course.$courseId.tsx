import { createFileRoute, Link } from "@tanstack/react-router";
import { sampleCourses } from "@/components/CourseCard";
import { getStoredUser } from "@/lib/auth";
import { CheckCircle2, PlayCircle, ShieldCheck, ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";

const courseVideoMap: Record<string, string> = {
  "react-foundations": "SqcY0GlETPk",
  "advanced-typescript": "R9I85RhI7Cg",
  "node-apis": "rOpEN1JDaD0",
  "secure-coding": "O0FPUB3ZTo4",
};

export const Route = createFileRoute("/student/course/$courseId")({
  component: CourseViewer,
});

const lessons = [
  { id: "l1", title: "Welcome & overview", duration: "03:21", done: true },
  { id: "l2", title: "Setting up your environment", duration: "08:14", done: true },
  { id: "l3", title: "Your first component", duration: "12:40", done: false, current: true },
  { id: "l4", title: "Props & state", duration: "15:02", done: false },
  { id: "l5", title: "Lifecycle & effects", duration: "18:22", done: false },
  { id: "l6", title: "Patterns & composition", duration: "21:11", done: false },
];

function CourseViewer() {
  const { courseId } = Route.useParams();
  const course = sampleCourses.find((c) => c.id === courseId) ?? sampleCourses[0];
  const user = getStoredUser();
  const [tick, setTick] = useState(() => new Date().toLocaleTimeString());

  useEffect(() => {
    const id = window.setInterval(() => setTick(new Date().toLocaleTimeString()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div>
      <Link to="/student/courses" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Back to courses
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        <div>
          {/* Player with watermark + protection deterrents */}
          <div
            className="group relative aspect-video overflow-hidden rounded-2xl border border-border/50 bg-black shadow-elegant"
            onContextMenu={(e) => e.preventDefault()}
          >
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube.com/embed/${courseVideoMap[courseId] ?? "dQw4w9WgXcQ"}?modestbranding=1&rel=0&showinfo=0`}
              title={course.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            {/* Dynamic watermark overlay */}
            <div className="pointer-events-none absolute inset-0 select-none">
              <div className="absolute right-4 top-4 rounded-md bg-black/40 px-2 py-1 text-[10px] font-medium text-white/70 backdrop-blur">
                {user?.email ?? "guest"} · {tick}
              </div>
              <div className="absolute bottom-6 left-6 text-xs font-medium text-white/15">
                {user?.email ?? "guest"} · Lumen LMS
              </div>
              <div className="absolute right-10 bottom-1/3 -rotate-12 text-2xl font-bold text-white/10">
                {user?.email ?? "guest"}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 text-xs text-primary">
                <ShieldCheck className="h-3 w-3" /> Watermarked
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">By {course.trainer} · {course.hours} · {course.modules} modules</p>

            <div className="mt-6 rounded-2xl border border-border/50 bg-gradient-card p-5 text-sm text-muted-foreground">
              In this lesson, we explore how to structure your first component, with
              practical examples and patterns. Downloads and sharing are disabled to
              protect course content.
            </div>
          </div>
        </div>

        {/* Playlist */}
        <aside className="rounded-2xl border border-border/50 bg-gradient-card">
          <div className="border-b border-border/40 p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Module 1</div>
            <div className="font-semibold">Getting started</div>
          </div>
          <ul className="divide-y divide-border/30">
            {lessons.map((l) => (
              <li
                key={l.id}
                className={`flex items-center gap-3 px-4 py-3 text-sm transition-smooth hover:bg-muted/20 ${
                  l.current ? "bg-primary/10" : ""
                }`}
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-full ${l.done ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                  {l.done ? <CheckCircle2 className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className={`truncate ${l.current ? "font-medium text-foreground" : ""}`}>{l.title}</div>
                  <div className="text-[11px] text-muted-foreground">{l.duration}</div>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
