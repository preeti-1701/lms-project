import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, BookOpen, LayoutDashboard, LogOut } from "lucide-react";
import { getStoredUser, clearStoredUser, type StoredUser } from "@/lib/auth";
import { toast } from "sonner";

export function HeaderUser() {
  const navigate = useNavigate();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getStoredUser());
    const onStorage = () => setUser(getStoredUser());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-[180px]" aria-hidden />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link to="/login">Sign in</Link>
        </Button>
        <Button
          asChild
          className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
        >
          <Link to="/login">
            Get started <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  const dashboardTo =
    user.role === "admin" ? "/admin" : user.role === "trainer" ? "/trainer" : "/student";
  const initials = user.email.slice(0, 2).toUpperCase();

  const handleLogout = () => {
    clearStoredUser();
    setUser(null);
    toast.success("Signed out");
    navigate({ to: "/", replace: true });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        asChild
        size="sm"
        className="hidden bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90 md:inline-flex"
      >
        <Link to="/courses">
          <BookOpen className="mr-1 h-4 w-4" /> Browse & enroll
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-2 py-1 pr-3 text-xs font-medium text-foreground transition-smooth hover:border-primary/50"
            aria-label="User menu"
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-gradient-primary text-[10px] text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline-block max-w-[140px] truncate">
              {user.email}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="truncate text-sm">{user.email}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {user.role}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to={dashboardTo}>
              <LayoutDashboard className="mr-2 h-4 w-4" /> My dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/courses">
              <BookOpen className="mr-2 h-4 w-4" /> Browse courses
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
