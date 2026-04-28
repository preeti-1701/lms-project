import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import heroBg from "@/assets/hero-bg.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Lumen LMS" },
      { name: "description", content: "Sign in to your Lumen LMS account." },
    ],
  }),
  component: LoginPage,
});

type Role = "admin" | "trainer" | "student";

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password");
      return;
    }

    const CREDENTIALS: Record<Role, { email: string; password: string }> = {
      admin: { email: "admin@lumen.com", password: "Admin@123" },
      trainer: { email: "trainer@lumen.com", password: "Trainer@123" },
      student: { email: "student@lumen.com", password: "Student@123" },
    };

    const normalizedEmail = email.trim().toLowerCase();
    const matched = (Object.entries(CREDENTIALS) as [Role, { email: string; password: string }][]).find(
      ([, c]) => c.email === normalizedEmail && c.password === password,
    );

    // If demo credentials match, use that role. Otherwise fall back to the
    // currently selected role tab so any email/password works for that role.
    const detectedRole: Role = matched ? matched[0] : role;
    const signedInEmail = matched ? matched[1].email : normalizedEmail;
    const target = detectedRole === "admin" ? "/admin" : detectedRole === "trainer" ? "/trainer" : "/";

    try {
      setLoading(true);
      setRole(detectedRole);
      sessionStorage.setItem("lumen_user", JSON.stringify({ email: signedInEmail, role: detectedRole }));
      toast.success(`Welcome back · signed in as ${detectedRole}`);
      await navigate({ to: target, replace: true });
    } catch {
      setLoading(false);
      toast.error("Sign in failed. Please try again.");
    }
  };

  return (
    <div className="relative grid min-h-screen w-full bg-background lg:grid-cols-2">
      {/* Left visual */}
      <div className="relative hidden overflow-hidden lg:block">
        <div
          className="absolute inset-0"
          style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover" }}
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo />
          <div className="max-w-md">
            <h2 className="text-4xl font-bold tracking-tight text-gradient">
              Secure learning, beautifully delivered.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Single-session enforcement, watermarked playback, and role-based
              dashboards — out of the box.
            </p>
            <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              JWT sessions · bcrypt · device tracking
            </div>
          </div>
          <p className="text-xs text-muted-foreground">© Lumen LMS</p>
        </div>
      </div>

      {/* Back to home */}
      <Link
        to="/"
        className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md transition-smooth hover:border-primary/50 hover:text-foreground md:right-6 md:top-6"
        aria-label="Back to home"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to home
      </Link>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue to your learning portal.
          </p>

          {/* Role tabs (demo) */}
          <div className="mt-6 grid grid-cols-3 gap-1 rounded-xl border border-border/60 bg-muted/30 p-1">
            {(["student", "trainer", "admin"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-lg px-3 py-2 text-xs font-medium capitalize transition-smooth ${
                  role === r
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-muted/30"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline">
                  Forgot?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-muted/30"
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full bg-gradient-primary text-primary-foreground shadow-glow transition-smooth hover:opacity-95"
            >
              {loading ? "Signing in…" : (
                <>
                  Sign in <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
            <div className="rounded-lg border border-border/40 bg-muted/20 p-3 text-[11px] text-muted-foreground">
              <p className="mb-1 font-medium text-foreground/80">Demo credentials</p>
              <p>Admin · admin@lumen.com / Admin@123</p>
              <p>Trainer · trainer@lumen.com / Trainer@123</p>
              <p>Student · student@lumen.com / Student@123</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/30 p-3 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5 text-primary" />
              We enforce a single active session per account. Logging in here will
              sign you out elsewhere.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
