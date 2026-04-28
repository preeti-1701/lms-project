import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { getStoredUser } from "@/lib/auth";

export const Route = createFileRoute("/student")({
  beforeLoad: () => {
    const u = getStoredUser();
    if (!u) throw redirect({ to: "/login" });
    if (u.role !== "student") throw redirect({ to: u.role === "admin" ? "/admin" : "/trainer" });
  },
  component: StudentLayout,
});

function StudentLayout() {
  const u = getStoredUser();
  return <AppLayout role="student" userEmail={u?.email ?? "student@lumen.io"} />;
}
