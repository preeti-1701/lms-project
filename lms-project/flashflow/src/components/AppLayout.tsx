import { Link, Outlet, useLocation, useRouter } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Video,
  Settings,
  LogOut,
  Bell,
  Search,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import { useEffect } from "react";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";

type Role = "admin" | "trainer" | "student";

const navByRole: Record<Role, { to: string; label: string; icon: React.ComponentType<{ className?: string }> }[]> = {
  admin: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/courses", label: "Courses", icon: BookOpen },
    { to: "/admin/sessions", label: "Sessions", icon: ShieldCheck },
    { to: "/admin/reports", label: "Reports", icon: BarChart3 },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ],
  trainer: [
    { to: "/trainer", label: "Dashboard", icon: LayoutDashboard },
    { to: "/trainer/courses", label: "My Courses", icon: BookOpen },
    { to: "/trainer/videos", label: "Videos", icon: Video },
  ],
  student: [
    { to: "/student", label: "Dashboard", icon: LayoutDashboard },
    { to: "/student/courses", label: "My Courses", icon: BookOpen },
  ],
};

export function AppLayout({ role, userEmail }: { role: Role; userEmail: string }) {
  const location = useLocation();
  const router = useRouter();
  const items = navByRole[role];

  // Security UX: deter right-click and common inspect shortcuts inside the app shell.
  useEffect(() => {
    const onContext = (e: MouseEvent) => {
      e.preventDefault();
      toast.warning("Right-click is disabled in the learning portal.");
    };
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(k)) ||
        (e.ctrlKey && k === "u") ||
        (e.ctrlKey && k === "s")
      ) {
        e.preventDefault();
        toast.warning("Developer shortcuts are disabled.");
      }
    };
    document.addEventListener("contextmenu", onContext);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar md:flex md:flex-col">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {items.map((item) => {
            const active = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-card"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <Link
            to="/login"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-smooth hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
          >
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/70 px-4 backdrop-blur-xl md:px-8">
          <div className="relative hidden flex-1 max-w-md md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search courses, students, videos…"
              className="h-10 border-border/60 bg-muted/40 pl-9"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
            </Button>
            <div className="flex items-center gap-3 rounded-full border border-border/60 bg-muted/30 py-1 pl-1 pr-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                {userEmail.charAt(0).toUpperCase()}
              </span>
              <span className="hidden text-xs font-medium sm:inline">{userEmail}</span>
              <span className="hidden rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary sm:inline">
                {role}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                toast.success("Signed out");
                router.navigate({ to: "/login" });
              }}
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
