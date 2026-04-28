import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/StatCard";
import { CourseCard, sampleCourses } from "@/components/CourseCard";

export const Route = createFileRoute("/trainer/courses")({
  component: () => (
    <div>
      <PageHeader title="My courses" subtitle="Curate modules and add YouTube video links." />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {sampleCourses.slice(0, 4).map((c) => <CourseCard key={c.id} course={c} />)}
      </div>
    </div>
  ),
});
