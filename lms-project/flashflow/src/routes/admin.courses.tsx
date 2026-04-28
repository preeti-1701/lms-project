import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCourses, getYouTubeId, priceFor as computePrice } from "@/lib/store";
import { useState } from "react";
import { Plus, Trash2, Video, PlayCircle, Pencil, Check as CheckIcon, X as XIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/courses")({
  component: AdminCourses,
});


function AdminCourses() {
  const { courses, addVideo, removeVideo, setPrice } = useCourses();
  const [open, setOpen] = useState(false);
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceDraft, setPriceDraft] = useState("");

  const savePrice = (id: string) => {
    const n = Number(priceDraft);
    if (!Number.isFinite(n) || n < 0) {
      toast.error("Enter a valid price");
      return;
    }
    setPrice(id, Math.round(n));
    toast.success("Price updated — synced to catalog & home");
    setEditingPrice(null);
  };
  const [url, setUrl] = useState("");

  const openForCourse = (id: string) => {
    setCourseId(id);
    setOpen(true);
  };

  const handleAdd = () => {
    if (!courseId || !title.trim() || !url.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!getYouTubeId(url)) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }
    addVideo(courseId, { title: title.trim(), url: url.trim() });
    toast.success("Video added — visible on the home page & courses catalog");
    setTitle("");
    setUrl("");
    setOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Courses"
        subtitle="Manage every course — videos sync instantly to the homepage and public catalog."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95">
                <Plus className="mr-1 h-4 w-4" /> Add video
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a YouTube video</DialogTitle>
                <DialogDescription>
                  New videos appear instantly in the course list and on the home page highlights.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Course</Label>
                  <Select value={courseId} onValueChange={setCourseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Video title</Label>
                  <Input
                    placeholder="Lesson 1 — Introduction"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>YouTube URL</Label>
                  <Input
                    placeholder="https://www.youtube.com/watch?v=…"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-primary text-primary-foreground"
                  onClick={handleAdd}
                >
                  Add video
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
              <div
                className="relative aspect-video w-full overflow-hidden"
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
                  <PlayCircle className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-white/90" />
                )}
                <div className="absolute bottom-3 left-4 rounded-md bg-black/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur">
                  {c.videos.length} {c.videos.length === 1 ? "video" : "videos"} · {c.modules} modules
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingPrice(c.id);
                    setPriceDraft(String(price));
                  }}
                  className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-gradient-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-glow transition-smooth hover:scale-105"
                  title="Click to edit price"
                >
                  ₹{price}
                  <Pencil className="h-3 w-3" />
                </button>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-semibold">{c.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">By {c.trainer} · {c.hours}</p>

                <div className="mt-4 rounded-xl border border-border/50 bg-background/40 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <Video className="h-3 w-3" /> Lessons
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-[11px] text-primary hover:text-primary"
                      onClick={() => openForCourse(c.id)}
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add
                    </Button>
                  </div>
                  {c.videos.length === 0 ? (
                    <p className="py-2 text-center text-[11px] text-muted-foreground">
                      No videos yet. Click Add to upload the first lesson.
                    </p>
                  ) : (
                    <ul className="space-y-1.5">
                      {c.videos.map((v) => (
                        <li
                          key={v.id}
                          className="flex items-center justify-between gap-2 rounded-md bg-muted/30 px-2 py-1.5 text-xs"
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <PlayCircle className="h-3 w-3 shrink-0 text-primary" />
                            <span className="truncate">{v.title}</span>
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 text-destructive hover:text-destructive"
                            onClick={() => {
                              removeVideo(c.id, v.id);
                              toast.success("Video removed — synced everywhere");
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/40 pt-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">One-time price</div>
                    {editingPrice === c.id ? (
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-lg font-bold">₹</span>
                        <Input
                          type="number"
                          min={0}
                          value={priceDraft}
                          onChange={(e) => setPriceDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") savePrice(c.id);
                            if (e.key === "Escape") setEditingPrice(null);
                          }}
                          autoFocus
                          className="h-8 w-20 px-2 text-base font-bold"
                        />
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-success" onClick={() => savePrice(c.id)}>
                          <CheckIcon className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground" onClick={() => setEditingPrice(null)}>
                          <XIcon className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPrice(c.id);
                          setPriceDraft(String(price));
                        }}
                        className="mt-0.5 inline-flex items-center gap-1.5 rounded-md text-lg font-bold transition-smooth hover:text-primary"
                      >
                        ₹{price}
                        <Pencil className="h-3 w-3 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</div>
                    <div className={`text-xs font-semibold ${c.videos.length > 0 ? "text-success" : "text-warning"}`}>
                      {c.videos.length > 0 ? "Published" : "Draft"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
