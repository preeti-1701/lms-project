import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard } from "@/components/dashboard/StatCard";
import { CourseCard, sampleCourses } from "@/components/CourseCard";
import { BookOpen, Clock, Trophy, Flame } from "lucide-react";

export const Route = createFileRoute("/student/")({
  component: StudentDashboard,
});

function StudentDashboard() {
  return (
    <div>
      <PageHeader title="Keep learning" subtitle="Pick up where you left off." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Enrolled courses" value="6" icon={BookOpen} />
        <StatCard label="Hours this week" value="4h 12m" delta="+22%" icon={Clock} accent="success" />
        <StatCard label="Certificates" value="2" icon={Trophy} accent="warning" />
        <StatCard label="Day streak" value="9" icon={Flame} />
      </div>

      <h2 className="mt-8 mb-4 text-lg font-semibold">Continue watching</h2>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {sampleCourses.filter((c) => c.progress > 0 && c.progress < 100).map((c) => (
          <CourseCard key={c.id} course={c} />
        ))}
      </div>
    </div>
  );
}
