import { Link } from "@tanstack/react-router";
import { PlayCircle, Clock, BarChart3 } from "lucide-react";

export type SampleCourse = {
  id: string;
  title: string;
  trainer: string;
  modules: number;
  hours: string;
  progress: number;
  hue: number;
};

export const sampleCourses: SampleCourse[] = [
  { id: "react-foundations", title: "React Foundations", trainer: "Amy Tran", modules: 8, hours: "6h 20m", progress: 72, hue: 280 },
  { id: "advanced-typescript", title: "Advanced TypeScript", trainer: "Jade Park", modules: 10, hours: "8h 05m", progress: 38, hue: 220 },
  { id: "design-systems", title: "Design Systems in Practice", trainer: "Amy Tran", modules: 6, hours: "4h 45m", progress: 100, hue: 320 },
  { id: "node-apis", title: "Production Node.js APIs", trainer: "Marco Rossi", modules: 12, hours: "10h 12m", progress: 12, hue: 200 },
  { id: "leadership-101", title: "Engineering Leadership 101", trainer: "Lin Wei", modules: 5, hours: "3h 30m", progress: 0, hue: 260 },
  { id: "secure-coding", title: "Secure Coding Essentials", trainer: "Marco Rossi", modules: 9, hours: "7h 10m", progress: 56, hue: 300 },
];

export function CourseCard({ course }: { course: SampleCourse }) {
  return (
    <Link
      to="/student/course/$courseId"
      params={{ courseId: course.id }}
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-card transition-smooth hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow"
    >
      <div
        className="relative h-36 w-full overflow-hidden"
        style={{
          background: `linear-gradient(135deg, oklch(0.45 0.22 ${course.hue}), oklch(0.65 0.20 ${(course.hue + 40) % 360}))`,
        }}
      >
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <PlayCircle className="absolute right-4 top-4 h-7 w-7 text-white/80 transition-smooth group-hover:scale-110" />
        <div className="absolute bottom-3 left-4 rounded-md bg-black/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur">
          {course.modules} modules
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-base font-semibold">{course.title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">By {course.trainer}</p>
        <div className="mt-4 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{course.hours}</span>
          <span className="inline-flex items-center gap-1"><BarChart3 className="h-3 w-3" />{course.progress}% complete</span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-primary transition-all"
            style={{ width: `${course.progress}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
