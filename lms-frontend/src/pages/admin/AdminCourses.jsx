import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import Modal from "../../components/shared/Modal";
import FormField from "../../components/shared/FormField";

// ── helpers ──────────────────────────────────────────────────────────
function btnS(color, bg, border, full = false) {
  return {
    padding: ".65rem 1.1rem", background: bg, border: `1px solid ${border}`,
    borderRadius: "9px", color, fontFamily: "'DM Sans', sans-serif",
    fontSize: ".8125rem", cursor: "pointer", width: full ? "100%" : "auto",
  };
}

// ── Delete Video Confirmation Modal ──────────────────────────────────
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
        <button onClick={onClose} style={btnS("var(--text-dim)", "var(--bg-hover)", "var(--border-strong)")}>Cancel</button>
        <button onClick={confirm} disabled={loading}
          style={{ ...btnS("#f87171", "rgba(239,68,68,.08)", "rgba(239,68,68,.3)"), flex: 1, opacity: loading ? .6 : 1 }}>
          {loading ? "Deleting…" : "🗑 Delete Video"}
        </button>
      </div>
    </div>
  );
}

// ── Assign Modal ─────────────────────────────────────────────────────
function AssignModal({ courses, onClose }) {
  const [form, setForm]       = useState({ student: "", course: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.student || !form.course) { setError("Fill all fields."); return; }
    setLoading(true); setError("");
    try {
      await api.post("/enrollments/assign/", { student: Number(form.student), course: Number(form.course) });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || "Assignment failed.");
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div style={{ textAlign: "center", padding: ".75rem 0", fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ fontSize: "2rem", marginBottom: ".75rem" }}>✓</div>
      <div style={{ color: "var(--text-body)", marginBottom: "1.5rem" }}>Course assigned successfully!</div>
      <button onClick={onClose} style={btnS("#ecaf4f", "rgba(236,175,79,.1)", "rgba(236,175,79,.3)")}>Done</button>
    </div>
  );

  return (
    <form onSubmit={submit} noValidate>
      <FormField label="Student ID" name="student" type="number" value={form.student} onChange={handle}
        placeholder="Enter student user ID" required />
      <FormField label="Course" name="course" value={form.course} onChange={handle}
        options={courses.map((c) => ({ value: c.id, label: c.title }))}
        placeholder="Select a course" required />
      {error && <div style={{ fontSize: ".8rem", color: "#f87171", marginBottom: ".75rem" }}>{error}</div>}
      <div style={{ fontSize: ".7rem", color: "var(--text-faint)", marginBottom: "1rem", lineHeight: 1.6 }}>
        💡 Becomes a dropdown once <code style={{ fontFamily: "monospace", background: "rgba(255,255,255,.05)", padding: ".1rem .25rem", borderRadius: 3 }}>GET /api/auth/users/</code> is added.
      </div>
      <button type="submit" disabled={loading}
        style={btnS("#ecaf4f", "rgba(236,175,79,.12)", "rgba(236,175,79,.35)", true)}>
        {loading ? "Assigning…" : "Assign Course"}
      </button>
    </form>
  );
}

// ── Main Page ────────────────────────────────────────────────────────
export default function AdminCourses() {
  const [courses,      setCourses]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [showAssign,   setShowAssign]   = useState(false);
  const [expanded,     setExpanded]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data } = await api.get("/courses/list/");
      setCourses(data);
    } catch {
      setError("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  // Remove deleted video from local state without a full refetch
  const handleVideoDeleted = (videoId) => {
    setCourses((prev) =>
      prev.map((c) => ({
        ...c,
        videos: c.videos?.filter((v) => v.id !== videoId) ?? [],
      }))
    );
  };

  const S = {
    root:    { fontFamily: "'DM Sans', sans-serif" },
    hrow:    { display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1.75rem", gap: "1rem", flexWrap: "wrap" },
    heading: { fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", color: "var(--text-primary)", letterSpacing: "-.02em", marginBottom: ".3rem" },
    sub:     { fontSize: ".8125rem", color: "var(--text-faint)", fontWeight: 300 },
    grid:    { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: ".85rem" },
    card:    { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden", transition: "border-color .2s", animation: "appear .3s ease both" },
  };

  return (
    <div style={S.root}>
      {/* Header */}
      <div style={S.hrow}>
        <div>
          <div style={S.heading}>Courses</div>
          <div style={S.sub}>{courses.length} course{courses.length !== 1 ? "s" : ""} on the platform</div>
        </div>
        <div style={{ display: "flex", gap: ".5rem" }}>
          <button onClick={fetchCourses} style={btnS("var(--text-dim)", "var(--bg-card)", "var(--border)")}>↻ Refresh</button>
          <button onClick={() => setShowAssign(true)} style={btnS("#ecaf4f", "rgba(236,175,79,.12)", "rgba(236,175,79,.3)")}>
            + Assign Course
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,.07)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 10, padding: ".85rem 1rem", color: "#f87171", fontSize: ".875rem", marginBottom: "1.25rem" }}>
          {error}
        </div>
      )}

      {/* Skeleton */}
      {loading ? (
        <div style={S.grid}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ ...S.card, padding: "1rem", animation: "pulse 1.4s ease infinite" }}>
              <div style={{ height: 16, background: "var(--bg-hover)", borderRadius: 5, width: "60%", marginBottom: 8 }} />
              <div style={{ height: 12, background: "var(--bg-hover)", borderRadius: 5, width: "40%" }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={S.grid}>
          {courses.map((course, i) => (
            <div key={course.id}
              style={{ ...S.card, animationDelay: `${i * 50}ms` }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--border-strong)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
            >
              {/* Card header — click to expand */}
              <div
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.1rem", cursor: "pointer", gap: ".6rem" }}
                onClick={() => setExpanded(expanded === course.id ? null : course.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: ".7rem", minWidth: 0 }}>
                  <div style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 8, background: "rgba(236,175,79,.1)", border: "1px solid rgba(236,175,79,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>
                    📘
                  </div>
                  <div>
                    <div style={{ fontSize: ".875rem", fontWeight: 500, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {course.title}
                    </div>
                    <div style={{ fontSize: ".7rem", color: "var(--text-faint)", marginTop: ".12rem" }}>
                      {course.videos?.length || 0} video{course.videos?.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                <button style={{ background: "none", border: "1px solid var(--border)", borderRadius: 5, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-faint)", fontSize: ".6rem", cursor: "pointer", flexShrink: 0, transition: "transform .2s", transform: expanded === course.id ? "rotate(180deg)" : "none" }}>
                  ▾
                </button>
              </div>

              {/* Expanded video list */}
              {expanded === course.id && (
                <div style={{ borderTop: "1px solid #161618", padding: ".5rem" }}>
                  {(course.videos?.length || 0) === 0 ? (
                    <div style={{ padding: ".6rem 1rem", fontSize: ".75rem", color: "var(--text-ghost)" }}>No videos yet.</div>
                  ) : (
                    course.videos.map((v, vi) => (
                      <div
                        key={v.id}
                        style={{ display: "flex", alignItems: "center", gap: ".6rem", padding: ".5rem .75rem", borderRadius: 7, transition: "background .15s" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover2)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <span style={{ fontSize: ".6rem", color: "var(--text-ghost)", minWidth: 20 }}>
                          {String(vi + 1).padStart(2, "0")}
                        </span>
                        <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(236,175,79,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".45rem", color: "#ecaf4f", flexShrink: 0 }}>
                          ▶
                        </span>
                        <span style={{ fontSize: ".8rem", color: "var(--text-body)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {v.title}
                        </span>

                        {/* 🗑 Delete button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(v); }}
                          title="Delete video"
                          style={{ background: "none", border: "1px solid transparent", borderRadius: 6, padding: ".25rem .45rem", color: "var(--text-faint)", cursor: "pointer", fontSize: ".75rem", flexShrink: 0, transition: "all .15s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(239,68,68,.25)"; e.currentTarget.style.background = "rgba(239,68,68,.07)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-faint)"; e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "none"; }}
                        >
                          🗑
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showAssign && (
        <Modal title="Assign Course to Student" onClose={() => setShowAssign(false)}>
          <AssignModal courses={courses} onClose={() => setShowAssign(false)} />
        </Modal>
      )}

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