import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/sessions")({
  component: Sessions,
});

const sessions = [
  { user: "sarah@acme.io", device: "Chrome · macOS", ip: "103.21.44.12", started: "2m ago", location: "Bengaluru, IN" },
  { user: "amy@acme.io", device: "Safari · iPhone 15", ip: "172.58.10.22", started: "1h ago", location: "Berlin, DE" },
  { user: "marco@acme.io", device: "Edge · Windows 11", ip: "84.20.5.99", started: "12m ago", location: "Milan, IT" },
  { user: "rahul@acme.io", device: "Chrome · Android", ip: "49.36.110.5", started: "8m ago", location: "Mumbai, IN" },
];

function Sessions() {
  return (
    <div>
      <PageHeader
        title="Active sessions"
        subtitle="One session per user. Force logout any device instantly."
      />
      <div className="rounded-2xl border border-border/50 bg-gradient-card">
        <div className="flex items-center gap-2 border-b border-border/40 px-5 py-3 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" /> {sessions.length} live sessions
        </div>
        <ul className="divide-y divide-border/40">
          {sessions.map((s) => (
            <li key={s.user} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                {s.user.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-medium">{s.user}</div>
                <div className="text-xs text-muted-foreground">{s.device} · {s.location}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-xs text-muted-foreground">{s.ip}</div>
                <div className="text-[10px] text-muted-foreground">started {s.started}</div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
                onClick={() => toast.success(`Force logged out ${s.user}`)}
              >
                <LogOut className="mr-1 h-3.5 w-3.5" /> Logout
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
