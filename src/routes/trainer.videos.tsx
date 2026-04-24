import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/StatCard";
import { Video } from "lucide-react";

export const Route = createFileRoute("/trainer/videos")({
  component: () => {
    const videos = [
      { title: "Intro to React Hooks", course: "React Foundations", duration: "12:40" },
      { title: "useEffect deep dive", course: "React Foundations", duration: "18:22" },
      { title: "Generics in TypeScript", course: "Advanced TypeScript", duration: "22:11" },
      { title: "Tokens & theming", course: "Design Systems", duration: "14:05" },
      { title: "Building accessible buttons", course: "Design Systems", duration: "09:55" },
    ];
    return (
      <div>
        <PageHeader title="Videos" subtitle="Every video served via secure embedded YouTube player." />
        <div className="rounded-2xl border border-border/50 bg-gradient-card">
          <ul className="divide-y divide-border/40">
            {videos.map((v) => (
              <li key={v.title} className="flex items-center gap-4 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Video className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{v.title}</div>
                  <div className="text-xs text-muted-foreground">{v.course}</div>
                </div>
                <span className="font-mono text-xs text-muted-foreground">{v.duration}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  },
});
