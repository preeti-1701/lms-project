import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Activity, Download, Eye, Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reports")({
  component: AdminReports,
});

const engagement = [
  { course: "React Fundamentals", enrolled: 412, completion: "78%", hours: "1,284h" },
  { course: "Advanced TypeScript", enrolled: 218, completion: "64%", hours: "742h" },
  { course: "Design Systems", enrolled: 305, completion: "82%", hours: "1,012h" },
  { course: "Cloud Security 101", enrolled: 174, completion: "55%", hours: "498h" },
  { course: "Product Analytics", enrolled: 261, completion: "71%", hours: "880h" },
];

const logs = [
  { user: "sarah@acme.io", event: "login", ip: "103.21.44.12", device: "Chrome · macOS", at: "2m ago" },
  { user: "rahul@acme.io", event: "video.view · React Fundamentals M3", ip: "49.36.110.5", device: "Chrome · Android", at: "8m ago" },
  { user: "amy@acme.io", event: "course.publish · Design Systems", ip: "172.58.10.22", device: "Safari · iPhone", at: "1h ago" },
  { user: "marco@acme.io", event: "user.disable · lin@acme.io", ip: "84.20.5.99", device: "Edge · Windows", at: "3h ago" },
  { user: "jade@acme.io", event: "login.failed (3x)", ip: "59.12.88.40", device: "Chrome · Windows", at: "5h ago" },
];

function AdminReports() {
  return (
    <div>
      <PageHeader
        title="Reports & activity"
        subtitle="Engagement analytics, audit logs, and exportable insights."
        action={
          <Button
            variant="outline"
            className="border-border/60 bg-muted/30"
            onClick={() => toast.success("Report exported as CSV")}
          >
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Logins (24h)" value="1,284" delta="+18%" icon={Activity} />
        <StatCard label="Video views (24h)" value="9,402" delta="+24%" icon={Eye} accent="success" />
        <StatCard label="Avg. watch time" value="42m" delta="+6%" icon={Clock} />
        <StatCard label="Completion rate" value="71%" delta="+3%" icon={TrendingUp} accent="success" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-border/50 bg-gradient-card p-6 lg:col-span-3">
          <h2 className="text-lg font-semibold">Course engagement</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border/40">
                  <th className="px-2 py-3 font-medium">Course</th>
                  <th className="px-2 py-3 font-medium">Enrolled</th>
                  <th className="px-2 py-3 font-medium">Completion</th>
                  <th className="px-2 py-3 font-medium">Hours</th>
                </tr>
              </thead>
              <tbody>
                {engagement.map((c) => (
                  <tr key={c.course} className="border-b border-border/30 last:border-0">
                    <td className="px-2 py-3 font-medium">{c.course}</td>
                    <td className="px-2 py-3 text-muted-foreground">{c.enrolled}</td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-gradient-primary"
                            style={{ width: c.completion }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{c.completion}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3 font-mono text-xs text-muted-foreground">{c.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-gradient-card p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold">Audit log</h2>
          <ul className="mt-4 space-y-3">
            {logs.map((l, i) => (
              <li key={i} className="rounded-lg border border-border/40 bg-muted/20 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{l.user}</span>
                  <span className="text-[10px] text-muted-foreground">{l.at}</span>
                </div>
                <div className="mt-1 text-muted-foreground">{l.event}</div>
                <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                  {l.ip} · {l.device}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
