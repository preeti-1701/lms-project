import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { ShieldCheck, Droplet, MousePointerClick, Clock, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const [watermark, setWatermark] = useState(true);
  const [rightClick, setRightClick] = useState(true);
  const [singleSession, setSingleSession] = useState(true);
  const [hibp, setHibp] = useState(false);
  const [timeout, setTimeoutMins] = useState("30");

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="System-wide security, content protection, and session policies."
        action={
          <Button
            className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
            onClick={() => toast.success("Settings saved")}
          >
            <Save className="mr-2 h-4 w-4" /> Save changes
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <SettingCard
          icon={Droplet}
          title="Dynamic video watermark"
          desc="Overlay user email and timestamp on every video stream to deter piracy."
          checked={watermark}
          onChange={setWatermark}
        />
        <SettingCard
          icon={MousePointerClick}
          title="Disable right-click"
          desc="Prevent context menu and common inspect shortcuts inside the portal."
          checked={rightClick}
          onChange={setRightClick}
        />
        <SettingCard
          icon={ShieldCheck}
          title="Single active session"
          desc="Logging in elsewhere automatically signs the user out of the previous device."
          checked={singleSession}
          onChange={setSingleSession}
        />
        <SettingCard
          icon={ShieldCheck}
          title="Leaked password check (HIBP)"
          desc="Block sign-ups using passwords found in known data breaches."
          checked={hibp}
          onChange={setHibp}
        />

        <div className="rounded-2xl border border-border/50 bg-gradient-card p-6 lg:col-span-2">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Clock className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Session timeout</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Auto sign-out idle users after the configured number of minutes.
              </p>
              <div className="mt-4 flex max-w-xs items-center gap-3">
                <Label htmlFor="timeout" className="shrink-0 text-xs text-muted-foreground">
                  Minutes
                </Label>
                <Input
                  id="timeout"
                  type="number"
                  min={5}
                  max={480}
                  value={timeout}
                  onChange={(e) => setTimeoutMins(e.target.value)}
                  className="h-10 bg-muted/40"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-gradient-card p-6 lg:col-span-2">
          <h3 className="font-semibold">Role permissions</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              { role: "Admin", perms: ["Full access", "Manage users", "Manage courses", "View audit logs"] },
              { role: "Trainer", perms: ["Create courses", "Upload videos", "View enrolled students"] },
              { role: "Student", perms: ["Watch enrolled courses", "View own progress"] },
            ].map((r) => (
              <div key={r.role} className="rounded-xl border border-border/40 bg-muted/20 p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {r.role}
                </div>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {r.perms.map((p) => (
                    <li key={p} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-primary" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingCard({
  icon: Icon,
  title,
  desc,
  checked,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-gradient-card p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold">{title}</h3>
            <Switch checked={checked} onCheckedChange={onChange} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
    </div>
  );
}
