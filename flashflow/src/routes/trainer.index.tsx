import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Video, BarChart3 } from "lucide-react";
import { CourseCard, sampleCourses } from "@/components/CourseCard";

export const Route = createFileRoute("/trainer/")({
  component: TrainerDashboard,
});

function TrainerDashboard() {
  const myCourses = sampleCourses.slice(0, 3);
  return (
    <div>
      <PageHeader
        title="Hello, Trainer"
        subtitle="Manage your courses and track learner engagement."
        action={
          <Button className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95">
            + Add video
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Your courses" value="3" icon={BookOpen} />
        <StatCard label="Active learners" value="412" delta="+9%" icon={Users} accent="success" />
        <StatCard label="Videos published" value="48" icon={Video} />
        <StatCard label="Avg completion" value="74%" delta="+3%" icon={BarChart3} />
      </div>

      <h2 className="mt-8 mb-4 text-lg font-semibold">Your courses</h2>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {myCourses.map((c) => <CourseCard key={c.id} course={c} />)}
      </div>
    </div>
  );
}
