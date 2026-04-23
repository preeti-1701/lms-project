import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/StatCard";
import { CourseCard, sampleCourses } from "@/components/CourseCard";

export const Route = createFileRoute("/student/courses")({
  component: () => (
    <div>
      <PageHeader title="My courses" subtitle="View-only access. Assigned by your administrator." />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {sampleCourses.map((c) => <CourseCard key={c.id} course={c} />)}
      </div>
    </div>
  ),
});
