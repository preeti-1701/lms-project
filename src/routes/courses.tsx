import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ArrowRight, PlayCircle, Check, X, Sparkles } from "lucide-react";
import { useCourses, getYouTubeId, priceFor as computePrice, type CourseVideo } from "@/lib/store";
import { getStoredUser } from "@/lib/auth";
import { HeaderUser } from "@/components/HeaderUser";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Courses — Lumen LMS" },
      { name: "description", content: "Browse Lumen LMS courses, watch lesson videos, and see pricing for each course." },
      { property: "og:title", content: "Courses — Lumen LMS" },
      { property: "og:description", content: "Watch course videos and view pricing for every Lumen LMS course." },
    ],
  }),
  component: CoursesPage,
});

type PlayingVideo = CourseVideo & { courseTitle: string; trainer: string; price: number };


function CoursesPage() {
  const { courses } = useCourses();
  const [playing, setPlaying] = useState<PlayingVideo | null>(null);
  const [user, setUser] = useState<ReturnType<typeof getStoredUser>>(null);
  useEffect(() => {
    setUser(getStoredUser());
    const onStorage = () => setUser(getStoredUser());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const enrollTo = user?.role === "student" ? "/student" : user?.role === "trainer" ? "/trainer" : user?.role === "admin" ? "/admin" : "/login";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <Link to="/" hash="features" className="transition-smooth hover:text-foreground">Features</Link>
            <Link to="/" hash="security" className="transition-smooth hover:text-foreground">Security</Link>
            <Link to="/" hash="pricing" className="transition-smooth hover:text-foreground">Pricing</Link>
            <Link to="/courses" className="text-foreground">Courses</Link>
          </nav>
          <HeaderUser />
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-8 pt-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Course catalog
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
            <span className="text-gradient">Watch, learn,</span> level up.
          </h1>
          <p className="mt-4 text-muted-foreground">
            Pick a course, preview lessons instantly, and unlock the full track with a one-time price.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => {
            const price = computePrice(c);
            const previewVideo = c.videos[0];
            const id = previewVideo ? getYouTubeId(previewVideo.url) : null;
            const thumb = id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;

            return (
              <div
                key={c.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-gradient-card transition-smooth hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow"
              >
                <button
                  type="button"
                  onClick={() =>
                    previewVideo &&
                    setPlaying({ ...previewVideo, courseTitle: c.title, trainer: c.trainer, price })
                  }
                  disabled={!previewVideo}
                  className="relative block aspect-video w-full overflow-hidden text-left disabled:cursor-default"
                  style={
                    !thumb
                      ? {
                          background: `linear-gradient(135deg, oklch(0.45 0.22 ${c.hue}), oklch(0.65 0.20 ${(c.hue + 40) % 360}))`,
                        }
                      : undefined
                  }
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={c.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 grid-pattern opacity-20" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {previewVideo && (
                    <PlayCircle className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 text-white/90 transition-transform group-hover:scale-110" />
                  )}
                  <div className="absolute bottom-3 left-4 rounded-md bg-black/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur">
                    {c.videos.length} {c.videos.length === 1 ? "video" : "videos"} · {c.modules} modules
                  </div>
                  <div className="absolute right-3 top-3 rounded-full bg-gradient-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-glow">
                    ₹{price}
                  </div>
                </button>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-semibold">{c.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">By {c.trainer} · {c.hours}</p>

                  {c.videos.length > 0 ? (
                    <ul className="mt-4 space-y-1.5">
                      {c.videos.slice(0, 3).map((v) => (
                        <li key={v.id}>
                          <button
                            type="button"
                            onClick={() =>
                              setPlaying({ ...v, courseTitle: c.title, trainer: c.trainer, price })
                            }
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground transition-smooth hover:bg-muted/50 hover:text-foreground"
                          >
                            <PlayCircle className="h-3.5 w-3.5 shrink-0 text-primary" />
                            <span className="line-clamp-1">{v.title}</span>
                          </button>
                        </li>
                      ))}
                      {c.videos.length > 3 && (
                        <li className="px-2 text-[11px] text-muted-foreground">
                          +{c.videos.length - 3} more lessons
                        </li>
                      )}
                    </ul>
                  ) : (
                    <p className="mt-4 text-xs text-muted-foreground">No videos yet — check back soon.</p>
                  )}

                  <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">One-time</div>
                      <div className="text-xl font-bold">₹{price}</div>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
                    >
                      <Link to={enrollTo}>Enroll</Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {playing && <PlayerModal video={playing} onClose={() => setPlaying(null)} />}

      <footer className="border-t border-border/40 py-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Lumen LMS. Crafted with care.
      </footer>
    </div>
  );
}

function PlayerModal({ video, onClose }: { video: PlayingVideo; onClose: () => void }) {
  const id = getYouTubeId(video.url);
  const embed = id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="glass relative w-full max-w-5xl overflow-hidden rounded-2xl border border-border/60 shadow-elegant"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-2 text-white transition-smooth hover:bg-black/70"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="grid gap-0 md:grid-cols-[1fr_320px]">
          <div className="aspect-video w-full bg-black">
            {embed ? (
              <iframe
                src={embed}
                title={video.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Unable to load video.
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4 border-t border-border/50 bg-card/60 p-6 md:border-l md:border-t-0">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                {video.courseTitle}
              </div>
              <h3 className="mt-1 text-lg font-semibold">{video.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">By {video.trainer}</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-background/40 p-4">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Full course access
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gradient">₹{video.price}</span>
                <span className="text-xs text-muted-foreground">one-time</span>
              </div>
              <ul className="mt-4 space-y-2 text-xs">
                {[
                  "All lessons & future updates",
                  "Watermarked secure playback",
                  "Certificate on completion",
                  "Cancel anytime",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-muted-foreground">
                    <Check className="mt-0.5 h-3.5 w-3.5 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="mt-4 w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
              >
                <Link to="/login">Enroll for ₹{video.price}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
