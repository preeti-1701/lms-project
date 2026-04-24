import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { getStoredUser } from "@/lib/auth";

export const Route = createFileRoute("/trainer")({
  beforeLoad: () => {
    const u = getStoredUser();
    if (!u) throw redirect({ to: "/login" });
    if (u.role !== "trainer") throw redirect({ to: u.role === "admin" ? "/admin" : "/student" });
  },
  component: TrainerLayout,
});

function TrainerLayout() {
  const u = getStoredUser();
  return <AppLayout role="trainer" userEmail={u?.email ?? "trainer@lumen.io"} />;
}
