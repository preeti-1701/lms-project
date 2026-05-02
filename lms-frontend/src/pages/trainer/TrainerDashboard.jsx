import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import Modal from "../../components/shared/Modal";
import FormField from "../../components/shared/FormField";

// ─── helpers ────────────────────────────────────────────────────────
function btnS(color, bg, border, full = false) {
  return {
    padding: ".65rem 1.1rem", background: bg,
    border: `1px solid ${border}`, borderRadius: "9px",
    color, fontFamily: "'DM Sans', sans-serif", fontSize: ".8125rem",
    cursor: "pointer", width: full ? "100%" : "auto",
    transition: "opacity .15s",
  };
}
function smBtnS(color, bg, border) {
  return { ...btnS(color, bg, border), padding: ".4rem .8rem", fontSize: ".75rem" };
}

// ─── Create Course Modal ─────────────────────────────────────────────
function CreateCourseModal({ onClose, onCreated }) {
  const [form, setForm]     = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [done, setDone]     = useState(null);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    setLoading(true); setError("");
    try {
      const { data } = await api.post("/courses/create/", form);
      setDone(data);
      onCreated?.(data);
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || "Failed to create course.");
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div style={{ textAlign: "center", padding: ".75rem 0", fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ fontSize: "2rem", marginBottom: ".75rem" }}>✓</div>
      <div style={{ color: "var(--text-body)", marginBottom: ".3rem" }}>
        Course <strong style={{ color: "var(--text-primary)" }}>"{done.title}"</strong> created!
      </div>
      <div style={{ fontSize: ".75rem", color: "var(--text-faint)", marginBottom: "1.5rem" }}>ID: {done.id}</div>
      <button onClick={onClose} style={btnS("#2dd4bf","rgba(45,212,191,.1)","rgba(45,212,191,.3)")}>Done</button>
    </div>
  );

  return (
    <form onSubmit={submit} noValidate>
      <FormField label="Course Title" name="title" value={form.title} onChange={handle}
        placeholder="e.g. Python Basics" required error={error && !form.title.trim() ? error : ""} />
      <FormField label="Description" name="description" value={form.description} onChange={handle}
        placeholder="What will students learn?" rows={3} />
      {error && <div style={{ fontSize: ".8rem", color: "#f87171", marginBottom: ".75rem" }}>{error}</div>}
      <button type="submit" disabled={loading}
        style={btnS("#2dd4bf","rgba(45,212,191,.1)","rgba(45,212,191,.3)", true)}>
        {loading ? "Creating…" : "Create Course"}
      </button>
    </form>
  );
}

// ─── Add Video Modal ─────────────────────────────────────────────────
function AddVideoModal({ courses, onClose, onAdded }) {
  const [form, setForm]     = useState({ course: "", title: "", youtube_url: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [done, setDone]     = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const isYouTube = (url) => /youtu(be\.com|\.be)/.test(url);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.course)              { setError("Select a course."); return; }
    if (!form.title.trim())        { setError("Video title is required."); return; }
    if (!isYouTube(form.youtube_url)) { setError("Enter a valid YouTube URL."); return; }
    setLoading(true); setError("");
    try {
      const { data } = await api.post("/courses/add-video/", {
        course: Number(form.course),
        title: form.title,
        youtube_url: form.youtube_url,
      });
      setDone(true);
      onAdded?.(data);
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || "Failed to add video.");
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div style={{ textAlign: "center", padding: ".75rem 0", fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ fontSize: "2rem", marginBottom: ".75rem" }}>▶</div>
      <div style={{ color: "var(--text-body)", marginBottom: "1.5rem" }}>Video added successfully!</div>
      <button onClick={onClose} style={btnS("#2dd4bf","rgba(45,212,191,.1)","rgba(45,212,191,.3)")}>Done</button>
    </div>
  );

  return (
    <form onSubmit={submit} noValidate>
      <FormField label="Course" name="course" value={form.course} onChange={handle}
        options={courses.map((c) => ({ value: c.id, label: c.title }))}
        placeholder="Select a course" required />
      <FormField label="Video Title" name="title" value={form.title} onChange={handle}
        placeholder="e.g. Introduction to Variables" required />
      <FormField label="YouTube URL" name="youtube_url" value={form.youtube_url} onChange={handle}
        placeholder="https://youtube.com/watch?v=..." required />
      {error && <div style={{ fontSize: ".8rem", color: "#f87171", marginBottom: ".75rem" }}>{error}</div>}
      <button type="submit" disabled={loading}
        style={btnS("#2dd4bf","rgba(45,212,191,.1)","rgba(45,212,191,.3)", true)}>
        {loading ? "Adding…" : "Add Video"}
      </button>
    </form>
  );
}

// ─── Assign Modal ────────────────────────────────────────────────────
function AssignModal({ courses, onClose }) {
  const [form, setForm]       = useState({ student: "", course: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [done, setDone]       = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.student || !form.course) { setError("Fill all fields."); return; }
    setLoading(true); setError("");
    try {
      await api.post("/enrollments/assign/", {
        student: Number(form.student),
        course: Number(form.course),
      });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || "Assignment failed.");
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div style={{ textAlign: "center", padding: ".75rem 0", fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ fontSize: "2rem", marginBottom: ".75rem" }}>✓</div>
      <div style={{ color: "var(--text-body)", marginBottom: "1.5rem" }}>Student enrolled successfully!</div>
      <button onClick={onClose} style={btnS("#2dd4bf","rgba(45,212,191,.1)","rgba(45,212,191,.3)")}>Done</button>
    </div>
  );

  return (
    <form onSubmit={submit} noValidate>
      <FormField label="Student ID" name="student" type="number" value={form.student}
        onChange={handle} placeholder="Enter student user ID" required />
      <FormField label="Course" name="course" value={form.course} onChange={handle}
        options={courses.map((c) => ({ value: c.id, label: c.title }))}
        placeholder="Select a course" required />
      <div style={{ fontSize: ".7rem", color: "var(--text-faint)", marginBottom: "1rem", lineHeight: 1.6 }}>
        💡 Student ID field will become a dropdown once{" "}
        <code style={{ fontFamily: "monospace", background: "rgba(255,255,255,.05)", padding: ".1rem .25rem", borderRadius: 3 }}>
          GET /api/auth/users/
        </code>{" "}
        is added to the backend.
      </div>
      {error && <div style={{ fontSize: ".8rem", color: "#f87171", marginBottom: ".75rem" }}>{error}</div>}
      <button type="submit" disabled={loading}
        style={btnS("#2dd4bf","rgba(45,212,191,.1)","rgba(45,212,191,.3)", true)}>
        {loading ? "Assigning…" : "Assign Course"}
      </button>
    </form>
  );
}

// ─── Delete Video Confirmation Modal ────────────────────────────────
function DeleteVideoModal({ video, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const confirm = async () => {
    setLoading(true); setError("");
    try {
      await api.delete(`/courses/delete-video/${video.id}/`);
      onDeleted(video.id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete video.");
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ fontSize: ".875rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
        Are you sure you want to delete{" "}
        <strong style={{ color: "var(--text-primary)" }}>"{video.title}"</strong>?
        <br />
        <span style={{ fontSize: ".8rem", color: "var(--text-dim)" }}>This action cannot be undone.</span>
      </div>
      {error && (
        <div style={{ fontSize: ".8rem", color: "#f87171", background: "rgba(239,68,68,.07)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 8, padding: ".65rem .9rem", marginBottom: ".9rem" }}>
          {error}
        </div>
      )}
      <div style={{ display: "flex", gap: ".75rem" }}>
        <button onClick={onClose} style={btnS("var(--text-dim)","var(--bg-hover)","var(--border-strong)")}>Cancel</button>
        <button onClick={confirm} disabled={loading}
          style={{ ...btnS("#f87171","rgba(239,68,68,.08)","rgba(239,68,68,.3)"), flex: 1, opacity: loading ? .6 : 1 }}>
          {loading ? "Deleting…" : "🗑 Delete Video"}
        </button>
      </div>
    </div>
  );
}

// ─── Course Card ─────────────────────────────────────────────────────
function CourseCard({ course, index, onAddVideo, onAssign, onDeleteVideo }) {
  const [open, setOpen] = useState(false);
  const videoCount = course.videos?.length || 0;

  return (
    <div
      style={{
        background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "13px",
        overflow: "hidden", transition: "border-color .2s, transform .2s",
        animation: "appear .3s ease both", animationDelay: `${index * 55}ms`,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* Header */}
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.1rem", cursor: "pointer", gap: ".65rem" }}
        onClick={() => setOpen((o) => !o)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: ".75rem", minWidth: 0 }}>
          <div style={{
            width: 36, height: 36, flexShrink: 0, borderRadius: 9,
            background: "rgba(45,212,191,.1)", border: "1px solid rgba(45,212,191,.18)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem",
          }}>
            {["📘","📗","📙","📕","📓"][course.id % 5]}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: ".9rem", fontWeight: 500, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {course.title}
            </div>
            <div style={{ fontSize: ".7rem", color: "var(--text-faint)", marginTop: ".12rem" }}>
              {videoCount} video{videoCount !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
        <span style={{ color: "var(--text-faint)", fontSize: ".65rem", flexShrink: 0, transition: "transform .2s", display: "inline-block", transform: open ? "rotate(180deg)" : "none" }}>▾</span>
      </div>

      {/* Description */}
      {course.description && (
        <div style={{ padding: "0 1.1rem .8rem", fontSize: ".8rem", color: "var(--text-faint)", fontWeight: 300, lineHeight: 1.6, borderTop: "1px solid #161618", paddingTop: ".65rem" }}>
          {course.description}
        </div>
      )}

      {/* Video list */}
      {open && (
        <div style={{ borderTop: "1px solid #161618", padding: ".4rem" }}>
          {videoCount === 0 ? (
            <div style={{ padding: ".65rem 1rem", fontSize: ".775rem", color: "var(--text-ghost)" }}>No videos yet.</div>
          ) : (
            course.videos.map((v, vi) => (
              <div key={v.id} style={{
                display: "flex", alignItems: "center", gap: ".6rem",
                padding: ".55rem .75rem", borderRadius: 7,
              }}>
                <span style={{ fontSize: ".6rem", color: "var(--border-strong)", minWidth: 18 }}>{String(vi + 1).padStart(2, "0")}</span>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(45,212,191,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".45rem", color: "#2dd4bf", flexShrink: 0 }}>▶</span>
                <span style={{ fontSize: ".775rem", color: "var(--text-body)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.title}</span>
                {/* 🗑 Delete */}
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteVideo(v); }}
                  title="Delete video"
                  style={{ background: "none", border: "1px solid transparent", borderRadius: 6, padding: ".25rem .45rem", color: "var(--border-strong)", cursor: "pointer", fontSize: ".75rem", flexShrink: 0, transition: "all .15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color="#f87171"; e.currentTarget.style.borderColor="rgba(239,68,68,.25)"; e.currentTarget.style.background="rgba(239,68,68,.07)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color="var(--border-strong)"; e.currentTarget.style.borderColor="transparent"; e.currentTarget.style.background="none"; }}
                >🗑</button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: ".5rem", padding: ".75rem 1.1rem", borderTop: "1px solid #161618" }}>
        <button onClick={() => onAddVideo(course)} style={smBtnS("#2dd4bf","rgba(45,212,191,.07)","rgba(45,212,191,.2)")}>
          + Video
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function TrainerDashboard() {
  const [courses,  setCourses]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [modal,        setModal]        = useState(null); // "create" | "video" | "assign"
  const [target,       setTarget]       = useState(null); // course pre-selected in modal
  const [deleteTarget, setDeleteTarget] = useState(null); // video targeted for deletion

  const fetchCourses = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data } = await api.get("/courses/my-courses/");
      setCourses(data);
    } catch {
      setError("Failed to load courses. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const openAddVideo = (course) => { setTarget(course); setModal("video"); };
  const openAssign   = (course) => { setTarget(course); setModal("assign"); };

  const handleVideoDeleted = (videoId) => {
    setCourses((prev) =>
      prev.map((c) => ({ ...c, videos: c.videos?.filter((v) => v.id !== videoId) ?? [] }))
    );
  };

  const totalVideos = courses.reduce((s, c) => s + (c.videos?.length || 0), 0);

  const ACTIONS = [
    { label: "+ New Course", key: "create", color: "#2dd4bf", bg: "rgba(45,212,191,.1)", border: "rgba(45,212,191,.3)" },
    { label: "+ Add Video",  key: "video",  color: "#818cf8", bg: "rgba(99,102,241,.1)", border: "rgba(99,102,241,.3)" },
    { label: "⊞ Assign",    key: "assign", color: "#ecaf4f", bg: "rgba(236,175,79,.1)", border: "rgba(236,175,79,.3)" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1.75rem", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", color: "var(--text-primary)", letterSpacing: "-.02em", marginBottom: ".3rem" }}>
            My Courses
          </div>
          <div style={{ fontSize: ".8125rem", color: "var(--text-faint)", fontWeight: 300 }}>
            {loading ? "Loading…" : `${courses.length} course${courses.length !== 1 ? "s" : ""} · ${totalVideos} video${totalVideos !== 1 ? "s" : ""}`}
          </div>
        </div>
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
          {ACTIONS.map(({ label, key, color, bg, border }) => (
            <button key={key} onClick={() => { setTarget(null); setModal(key); }}
              style={btnS(color, bg, border)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat strip */}
      {!loading && !error && (
        <div style={{ display: "flex", gap: ".6rem", marginBottom: "1.75rem", flexWrap: "wrap" }}>
          {[
            { n: courses.length, l: "Courses",  c: "#2dd4bf" },
            { n: totalVideos,    l: "Videos",   c: "#818cf8" },
          ].map(({ n, l, c }) => (
            <div key={l} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: ".55rem 1rem", display: "flex", flexDirection: "column", alignItems: "center", minWidth: 70 }}>
              <span style={{ fontSize: "1.3rem", fontWeight: 500, color: c, lineHeight: 1, marginBottom: ".2rem" }}>{n}</span>
              <span style={{ fontSize: ".65rem", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: ".07em" }}>{l}</span>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: "rgba(239,68,68,.07)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 10, padding: ".85rem 1rem", color: "#f87171", fontSize: ".875rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: ".75rem" }}>
          <span>{error}</span>
          <button onClick={fetchCourses} style={{ ...smBtnS("#f87171","rgba(239,68,68,.08)","rgba(239,68,68,.25)"), marginLeft: "auto" }}>Retry</button>
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: ".85rem" }}>
          {[1,2,3].map((i) => (
            <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 13, padding: "1rem", animation: "pulse 1.4s ease infinite" }}>
              <div style={{ height: 16, background: "var(--bg-hover)", borderRadius: 5, width: "65%", marginBottom: 8 }} />
              <div style={{ height: 12, background: "var(--bg-hover)", borderRadius: 5, width: "40%" }} />
            </div>
          ))}
        </div>
      )}

      {/* Course grid */}
      {!loading && !error && courses.length === 0 && (
        <div style={{ border: "1px dashed #1c1c20", borderRadius: 12, padding: "3.5rem 2rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: ".75rem" }}>📭</div>
          <div style={{ color: "var(--text-faint)", fontSize: ".9375rem", marginBottom: ".4rem" }}>No courses yet</div>
          <div style={{ color: "var(--text-ghost)", fontSize: ".8rem", fontWeight: 300 }}>Click "+ New Course" to create your first one</div>
        </div>
      )}

      {!loading && !error && courses.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: ".85rem" }}>
          {courses.map((c, i) => (
            <CourseCard key={c.id} course={c} index={i} onAddVideo={openAddVideo} onAssign={openAssign} onDeleteVideo={setDeleteTarget} />
          ))}
        </div>
      )}

      {/* Modals */}
      {modal === "create" && (
        <Modal title="Create New Course" onClose={() => setModal(null)}>
          <CreateCourseModal
            onClose={() => setModal(null)}
            onCreated={(c) => setCourses((prev) => [...prev, { ...c, videos: [] }])}
          />
        </Modal>
      )}

      {modal === "video" && (
        <Modal title="Add Video to Course" onClose={() => setModal(null)}>
          <AddVideoModal
            courses={courses}
            onClose={() => setModal(null)}
            onAdded={() => fetchCourses()}
          />
        </Modal>
      )}

      {modal === "assign" && (
        <Modal title="Assign Course to Student" onClose={() => setModal(null)}>
          <AssignModal courses={courses} onClose={() => setModal(null)} />
        </Modal>
      )}


      {/* Delete Video Modal */}
      {deleteTarget && (
        <Modal title="Delete Video" onClose={() => setDeleteTarget(null)}>
          <DeleteVideoModal
            video={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onDeleted={handleVideoDeleted}
          />
        </Modal>
      )}

      <style>{`
        @keyframes appear { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:.4} 50%{opacity:.8} }
      `}</style>
    </div>
  );
}