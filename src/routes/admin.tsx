import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { getStoredUser } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    const u = getStoredUser();
    if (!u) throw redirect({ to: "/login" });
    if (u.role !== "admin") throw redirect({ to: u.role === "trainer" ? "/trainer" : "/student" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  const u = getStoredUser();
  return <AppLayout role="admin" userEmail={u?.email ?? "admin@lumen.io"} />;
}
