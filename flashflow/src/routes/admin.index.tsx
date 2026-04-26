import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard } from "@/components/dashboard/StatCard";
import { Users, BookOpen, ShieldCheck, Activity, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const recentActivity = [
  { who: "sarah@acme.io", what: "completed React Fundamentals · Module 3", when: "2m ago" },
  { who: "rahul@acme.io", what: "logged in from Mumbai · Chrome", when: "8m ago" },
  { who: "lin@acme.io", what: "was assigned to Advanced TypeScript", when: "27m ago" },
  { who: "trainer-amy@acme.io", what: "uploaded 4 new videos to Design Systems", when: "1h ago" },
];

function AdminDashboard() {
  return (
    <div>
      <PageHeader
        title="Welcome back, Admin"
        subtitle="Here's what's happening across your learning portal today."
        action={
          <Button className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95">
            + Invite users
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value="2,481" delta="+12%" icon={Users} />
        <StatCard label="Active courses" value="64" delta="+4" icon={BookOpen} accent="success" />
        <StatCard label="Active sessions" value="318" delta="+22%" icon={Activity} />
        <StatCard label="Security alerts" value="2" icon={ShieldCheck} accent="warning" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/50 bg-gradient-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Engagement (last 30 days)</h2>
            <span className="text-xs text-muted-foreground">Hours watched</span>
          </div>
          <div className="mt-6 flex h-56 items-end gap-2">
            {[24, 38, 30, 52, 44, 70, 64, 80, 72, 90, 84, 96, 88, 102, 110, 92, 118, 124, 108, 132, 140, 128, 152, 144, 168, 160, 178, 184, 196, 210].map(
              (h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-md bg-gradient-primary opacity-80 transition-smooth hover:opacity-100"
                  style={{ height: `${(h / 210) * 100}%` }}
                />
              ),
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-gradient-card p-6">
          <h2 className="text-lg font-semibold">Recent activity</h2>
          <ul className="mt-4 space-y-4">
            {recentActivity.map((a, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                  {a.who.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="truncate font-medium">{a.who}</div>
                  <div className="text-xs text-muted-foreground">{a.what}</div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">{a.when}</div>
                </div>
                <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
