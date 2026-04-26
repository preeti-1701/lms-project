import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import {
  ShieldCheck,
  PlayCircle,
  Users,
  BarChart3,
  Sparkles,
  Lock,
  Globe,
  ArrowRight,
  Check,
} from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { useCourses, getYouTubeId } from "@/lib/store";
import { HeaderUser } from "@/components/HeaderUser";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumen LMS — Premium Learning Management Platform" },
      {
        name: "description",
        content:
          "A premium SaaS LMS for trainers and students. Secure video learning, role-based access, real-time session control.",
      },
      { property: "og:title", content: "Lumen LMS — Premium Learning Platform" },
      {
        property: "og:description",
        content: "Secure, beautiful, and built for modern training organizations.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition-smooth hover:text-foreground">Features</a>
            <Link to="/courses" className="transition-smooth hover:text-foreground">Courses</Link>
          </nav>
          <HeaderUser />
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-hero" />
        <div className="absolute inset-0 -z-10 grid-pattern opacity-30" />

        <div className="mx-auto max-w-7xl px-6 py-24 md:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Built for modern training teams
            </div>
            <h1 className="text-balance text-5xl font-bold tracking-tight md:text-7xl">
              <span className="text-gradient">Train smarter,</span>
              <br />
              <span className="text-foreground">grow faster.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              A secure, beautiful LMS with role-based dashboards, single-session
              enforcement, and watermarked video delivery — all in one platform.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                asChild
                className="h-12 bg-gradient-primary px-7 text-primary-foreground shadow-glow transition-smooth hover:scale-[1.02] hover:opacity-95"
              >
                <Link to="/login">
                  Launch your portal <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
              {["SOC2-ready", "JWT sessions", "Role-based access", "Watermarked video"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-primary" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Floating preview card */}
          <div className="relative mx-auto mt-20 max-w-5xl">
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-primary opacity-30 blur-3xl" />
            <div className="glass overflow-hidden rounded-2xl shadow-elegant">
              <div className="flex items-center gap-1.5 border-b border-border/40 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
                <span className="ml-3 text-xs text-muted-foreground">app.lumenlms.io / dashboard</span>
              </div>
              <div className="grid grid-cols-12 gap-4 p-6">
                <div className="col-span-3 space-y-2">
                  {["Overview", "Courses", "Students", "Analytics", "Security"].map((l, i) => (
                    <div
                      key={l}
                      className={`rounded-md px-3 py-2 text-xs ${
                        i === 0 ? "bg-primary/15 text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {l}
                    </div>
                  ))}
                </div>
                <div className="col-span-9 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { l: "Active learners", v: "2,481" },
                      { l: "Hours watched", v: "18.4k" },
                      { l: "Completion", v: "87%" },
                    ].map((s) => (
                      <div key={s.l} className="rounded-lg border border-border/40 bg-card/60 p-3">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
                        <div className="mt-1 text-lg font-semibold">{s.v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="h-32 rounded-lg border border-border/40 bg-gradient-card" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
            Everything your training program needs
          </h2>
          <p className="mt-4 text-muted-foreground">
            Three role-tailored experiences, one cohesive platform.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Single-session security", desc: "Only one active session per user. Force logout on new login, with IP and device tracking." },
            { icon: Users, title: "Role-based access", desc: "Admin, Trainer, and Student dashboards with granular, course-level permissions." },
            { icon: PlayCircle, title: "Watermarked playback", desc: "Embedded YouTube streaming with dynamic user watermarks — never expose raw video URLs." },
            { icon: BarChart3, title: "Beautiful analytics", desc: "Track completion, engagement, and progress with delightful, real-time visuals." },
            { icon: Lock, title: "Hardened by default", desc: "JWT auth, encrypted passwords, HTTPS-only, content protection deterrents built in." },
            { icon: Globe, title: "Mobile-first", desc: "Lightning fast on any device, with smooth navigation and accessible interactions." },
          ].map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-card p-6 transition-smooth hover:border-primary/40 hover:shadow-glow"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary transition-smooth group-hover:bg-gradient-primary group-hover:text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <LatestVideos />

      {/* Security band */}
      <section id="security" className="border-y border-border/40 bg-card/40">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                <ShieldCheck className="h-3.5 w-3.5" /> Security first
              </div>
              <h2 className="text-balance text-4xl font-bold tracking-tight">
                Protect your content. Trust your data.
              </h2>
              <p className="mt-4 text-muted-foreground">
                We don't just style a login screen. Lumen enforces single-session
                logins, hashes passwords with bcrypt, and decorates every video with
                a dynamic per-user watermark.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "JWT-based session validation with rotation",
                  "Force logout from any active device",
                  "Device + IP audit trail per login",
                  "Right-click & inspect shortcuts deterrents",
                ].map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-primary" />
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-primary opacity-25 blur-3xl" />
              <div className="glass space-y-4 rounded-2xl p-6 shadow-elegant">
                {[
                  { label: "Active sessions", val: "1 / device", color: "text-primary" },
                  { label: "Last login", val: "Just now · Chrome · Mumbai", color: "" },
                  { label: "Password", val: "bcrypt · rotated 12d ago", color: "text-success" },
                  { label: "2FA", val: "Email OTP enabled", color: "text-success" },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between rounded-lg border border-border/40 bg-card/60 p-4">
                    <span className="text-sm text-muted-foreground">{r.label}</span>
                    <span className={`text-sm font-medium ${r.color}`}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="mx-auto max-w-5xl px-6 py-24 text-center">
        <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
          Ready to upgrade your learning experience?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Spin up your branded portal in minutes. Onboard trainers and students with a
          single click.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button
            size="lg"
            asChild
            className="h-12 bg-gradient-primary px-7 text-primary-foreground shadow-glow transition-smooth hover:scale-[1.02]"
          >
            <Link to="/login">Get started free</Link>
          </Button>
          <Button size="lg" variant="outline" className="h-12 border-border/70 bg-muted/30 px-7">
            Contact sales
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/40 py-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Lumen LMS. Crafted with care.
      </footer>
    </div>
  );
}

function LatestVideos() {
  const { courses } = useCourses();
  const videos = courses
    .flatMap((c) => c.videos.map((v) => ({ ...v, courseTitle: c.title, trainer: c.trainer })))
    .sort((a, b) => (a.addedAt < b.addedAt ? 1 : -1))
    .slice(0, 6);

  if (videos.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Fresh from your trainers
          </div>
          <h2 className="text-balance text-4xl font-bold tracking-tight">Latest course videos</h2>
          <p className="mt-2 text-muted-foreground">Newly added lessons across all courses.</p>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => {
          const id = getYouTubeId(v.url);
          const thumb = id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
          return (
            <a
              key={v.id}
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group overflow-hidden rounded-2xl border border-border/50 bg-gradient-card transition-smooth hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow"
            >
              <div className="relative aspect-video overflow-hidden bg-muted">
                {thumb ? (
                  <img
                    src={thumb}
                    alt={v.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <PlayCircle className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <PlayCircle className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="p-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {v.courseTitle}
                </div>
                <h3 className="mt-1 line-clamp-2 text-sm font-semibold">{v.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">By {v.trainer}</p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
