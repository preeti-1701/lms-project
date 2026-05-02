import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useProgress } from "../../hooks/useProgress";
import VideoPlayer from "../../components/student/VideoPlayer";

// ── Skeleton ─────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="sd-skeleton-grid">
      {[1, 2, 3].map((i) => (
        <div key={i} className="sd-skeleton-card">
          <div className="sd-skel sd-skel-title" />
          <div className="sd-skel sd-skel-desc" />
          <div className="sd-skel sd-skel-bar" />
          <div className="sd-skel-videos">
            {[1, 2].map((j) => <div key={j} className="sd-skel sd-skel-video" />)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Progress Ring ─────────────────────────────────────────────────────
function ProgressRing({ pct, size = 36, stroke = 3 }) {
  const color = pct === 100 ? "#2dd4bf" : "#818cf8";
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ flexShrink: 0, transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e1e22" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
        strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset .5s ease, stroke .3s" }} />
    </svg>
  );
}

// ── Course Card ───────────────────────────────────────────────────────
function CourseCard({ enrollment, onPlayVideo, index, watchedIds, getCoursePct }) {
  const [open, setOpen] = useState(false);
  const { course_details: course } = enrollment;
  const videos = course.videos ?? [];
  const pct = getCoursePct(videos);
  const watchedCount = videos.filter((v) => watchedIds.has(v.id)).length;
  const statusColor = pct === 100 ? "#2dd4bf" : pct > 0 ? "#818cf8" : "#333";
  const statusLabel = pct === 100 ? "✓ Completed" : pct > 0 ? `${pct}% done` : "Not started";

  return (
    <div className="sd-card" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="sd-card-header" onClick={() => setOpen((o) => !o)}>
        <div className="sd-card-left">
          <ProgressRing pct={pct} />
          <div style={{ minWidth: 0 }}>
            <div className="sd-card-title">{course.title}</div>
            <div className="sd-card-meta">
              {watchedCount}/{videos.length} watched &nbsp;·&nbsp;
              <span style={{ color: statusColor }}>{statusLabel}</span>
            </div>
          </div>
        </div>
        <button className={`sd-expand-btn ${open ? "open" : ""}`}>▾</button>
      </div>

      {/* Thin progress bar */}
      <div className="sd-progress-bar-wrap">
        <div className="sd-progress-bar-fill" style={{
          width: `${pct}%`,
          background: pct === 100
            ? "linear-gradient(90deg,#2dd4bf,#06b6d4)"
            : "linear-gradient(90deg,#6366f1,#818cf8)",
        }} />
      </div>

      {course.description && (
        <div className="sd-card-desc">{course.description}</div>
      )}

      {open && (
        <div className="sd-video-list">
          {videos.length === 0 ? (
            <div className="sd-no-videos">No videos added yet</div>
          ) : (
            videos.map((video, vi) => {
              const watched = watchedIds.has(video.id);
              return (
                <button key={video.id}
                  className={`sd-video-row ${watched ? "watched" : ""}`}
                  onClick={() => onPlayVideo(video)}
                >
                  <div className="sd-video-num">{String(vi + 1).padStart(2, "0")}</div>
                  <div className={`sd-video-play-icon ${watched ? "done" : ""}`}>
                    {watched ? "✓" : "▶"}
                  </div>
                  <div className="sd-video-info">
                    <div className="sd-video-title">{video.title}</div>
                    {watched && <div style={{ fontSize: ".65rem", color: "#2dd4bf", marginTop: ".1rem" }}>Watched</div>}
                  </div>
                  <div className="sd-video-arrow">→</div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [activeVideo, setActiveVideo] = useState(null);

  const { watchedIds, markWatched, getCoursePct } = useProgress(user?.id);

  const fetchCourses = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data } = await api.get("/enrollments/my-courses/");
      setEnrollments(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load courses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  // Mark video as watched after 3 seconds of opening
  const handlePlayVideo = useCallback((video) => {
    setActiveVideo(video);
    setTimeout(() => markWatched(video.id), 3000);
  }, [markWatched]);

  const allVideos    = enrollments.flatMap((e) => e.course_details?.videos ?? []);
  const totalVideos  = allVideos.length;
  const totalWatched = allVideos.filter((v) => watchedIds.has(v.id)).length;
  const overallPct   = totalVideos ? Math.round((totalWatched / totalVideos) * 100) : 0;
  const completed    = enrollments.filter((e) => getCoursePct(e.course_details?.videos ?? []) === 100).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@300;400;500&display=swap');
        .sd-root { font-family:'DM Sans',sans-serif; }
        .sd-page-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:1.5rem; gap:1rem; flex-wrap:wrap; }
        .sd-page-title  { font-family:'Playfair Display',serif; font-size:1.6rem; color:var(--text-primary); letter-spacing:-.02em; margin-bottom:.25rem; }
        .sd-page-sub    { font-size:.8125rem; color:var(--text-faint); font-weight:300; }
        .sd-stats { display:flex; gap:.6rem; flex-wrap:wrap; }
        .sd-stat  { display:flex; flex-direction:column; align-items:center; padding:.5rem .85rem; background:var(--bg-card); border:1px solid var(--border); border-radius:10px; min-width:68px; }
        .sd-stat-num   { font-size:1.2rem; font-weight:500; color:#818cf8; line-height:1; margin-bottom:.2rem; }
        .sd-stat-label { font-size:.6rem; color:var(--text-faint); text-transform:uppercase; letter-spacing:.07em; }
        .sd-overall-bar-wrap { height:3px; background:var(--bg-hover); border-radius:2px; margin-bottom:1.75rem; overflow:hidden; }
        .sd-overall-bar-fill { height:100%; background:linear-gradient(90deg,#6366f1,#818cf8); transition:width .6s ease; border-radius:2px; }
        .sd-grid          { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:1rem; }
        .sd-skeleton-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:1rem; }
        .sd-skeleton-card { background:var(--bg-card); border:1px solid var(--border); border-radius:12px; padding:1.25rem; }
        .sd-skel          { background:var(--bg-hover); border-radius:5px; animation:sd-pulse 1.4s ease infinite; margin-bottom:.65rem; }
        @keyframes sd-pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        .sd-skel-title  { height:18px; width:70%; }
        .sd-skel-desc   { height:12px; width:90%; }
        .sd-skel-bar    { height:4px; width:100%; border-radius:2px; }
        .sd-skel-videos { margin-top:1rem; display:flex; flex-direction:column; gap:.4rem; }
        .sd-skel-video  { height:38px; width:100%; border-radius:7px; }
        .sd-card { background:var(--bg-card); border:1px solid var(--border); border-radius:12px; overflow:hidden; transition:border-color .2s,transform .2s; animation:sd-appear .3s ease both; }
        @keyframes sd-appear { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .sd-card:hover { border-color:var(--text-ghost); transform:translateY(-2px); }
        .sd-card-header { display:flex; align-items:center; justify-content:space-between; padding:1rem 1.1rem; cursor:pointer; user-select:none; gap:.75rem; }
        .sd-card-left   { display:flex; align-items:center; gap:.85rem; min-width:0; flex:1; }
        .sd-card-title  { font-size:.9rem; font-weight:500; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .sd-card-meta   { font-size:.72rem; color:var(--text-faint); font-weight:300; margin-top:.15rem; }
        .sd-expand-btn  { flex-shrink:0; background:none; border:1px solid var(--border); border-radius:6px; width:26px; height:26px; display:flex; align-items:center; justify-content:center; color:var(--text-faint); font-size:.7rem; cursor:pointer; transition:transform .2s,color .15s; }
        .sd-expand-btn.open { transform:rotate(180deg); color:#818cf8; }
        .sd-progress-bar-wrap { height:3px; background:#161618; }
        .sd-progress-bar-fill { height:100%; transition:width .5s ease; }
        .sd-card-desc  { padding:.6rem 1.1rem .8rem; font-size:.8rem; color:#3a3a3a; font-weight:300; line-height:1.6; border-top:1px solid var(--border-faint); padding-top:.6rem; }
        .sd-video-list { border-top:1px solid var(--border-faint); padding:.4rem; display:flex; flex-direction:column; gap:.25rem; animation:sd-expand .18s ease; }
        @keyframes sd-expand { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .sd-no-videos { padding:.65rem 1rem; font-size:.8rem; color:var(--text-ghost); text-align:center; }
        .sd-video-row { display:flex; align-items:center; gap:.7rem; padding:.6rem .85rem; background:none; border:1px solid transparent; border-radius:8px; cursor:pointer; width:100%; text-align:left; transition:background .15s,border-color .15s; }
        .sd-video-row:hover { background:rgba(99,102,241,.06); border-color:rgba(99,102,241,.15); }
        .sd-video-row.watched { opacity:.8; }
        .sd-video-row.watched:hover { background:rgba(45,212,191,.05); border-color:rgba(45,212,191,.15); }
        .sd-video-num { font-size:.6rem; color:var(--text-ghost); min-width:18px; font-variant-numeric:tabular-nums; }
        .sd-video-play-icon { width:22px; height:22px; border-radius:50%; background:rgba(99,102,241,.12); display:flex; align-items:center; justify-content:center; font-size:.45rem; color:#818cf8; flex-shrink:0; transition:background .2s,color .2s; }
        .sd-video-play-icon.done { background:rgba(45,212,191,.12); color:#2dd4bf; font-size:.65rem; }
        .sd-video-info  { flex:1; min-width:0; }
        .sd-video-title { font-size:.8rem; color:var(--text-body); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .sd-video-arrow { font-size:.7rem; color:#222; transition:color .15s; }
        .sd-video-row:hover .sd-video-arrow { color:#818cf8; }
        .sd-empty { grid-column:1/-1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:4rem 2rem; border:1px dashed var(--border); border-radius:12px; gap:.75rem; text-align:center; }
        .sd-empty-icon  { font-size:2rem; }
        .sd-empty-title { font-size:1rem; color:var(--text-faint); }
        .sd-empty-sub   { font-size:.8rem; color:var(--text-ghost); font-weight:300; }
        .sd-error { grid-column:1/-1; display:flex; align-items:center; gap:.75rem; background:rgba(239,68,68,.07); border:1px solid rgba(239,68,68,.2); border-radius:10px; padding:1rem 1.25rem; color:#f87171; font-size:.875rem; }
        .sd-retry-btn { margin-left:auto; background:none; border:1px solid rgba(239,68,68,.3); border-radius:7px; color:#f87171; font-family:'DM Sans',sans-serif; font-size:.75rem; padding:.35rem .8rem; cursor:pointer; }
      `}</style>

      <div className="sd-root">
        <div className="sd-page-header">
          <div>
            <div className="sd-page-title">My Courses</div>
            <div className="sd-page-sub">
              {loading ? "Loading…" : `${enrollments.length} enrolled course${enrollments.length !== 1 ? "s" : ""}`}
            </div>
          </div>
          {!loading && !error && (
            <div className="sd-stats">
              <div className="sd-stat">
                <span className="sd-stat-num">{enrollments.length}</span>
                <span className="sd-stat-label">Courses</span>
              </div>
              <div className="sd-stat">
                <span className="sd-stat-num">{totalWatched}/{totalVideos}</span>
                <span className="sd-stat-label">Watched</span>
              </div>
              <div className="sd-stat">
                <span className="sd-stat-num" style={{ color: "#2dd4bf" }}>{completed}</span>
                <span className="sd-stat-label">Done</span>
              </div>
              <div className="sd-stat">
                <span className="sd-stat-num" style={{ color: overallPct === 100 ? "#2dd4bf" : "#818cf8" }}>{overallPct}%</span>
                <span className="sd-stat-label">Overall</span>
              </div>
            </div>
          )}
        </div>

        {!loading && !error && totalVideos > 0 && (
          <div className="sd-overall-bar-wrap">
            <div className="sd-overall-bar-fill" style={{ width: `${overallPct}%` }} />
          </div>
        )}

        {loading ? <Skeleton /> : (
          <div className="sd-grid">
            {error && (
              <div className="sd-error">
                <span>⚠</span> {error}
                <button className="sd-retry-btn" onClick={fetchCourses}>Retry</button>
              </div>
            )}
            {!error && enrollments.length === 0 && (
              <div className="sd-empty">
                <span className="sd-empty-icon">📭</span>
                <span className="sd-empty-title">No courses assigned yet</span>
                <span className="sd-empty-sub">Ask your trainer to enroll you in a course</span>
              </div>
            )}
            {!error && enrollments.map((enrollment, i) => (
              <CourseCard
                key={enrollment.id}
                enrollment={enrollment}
                index={i}
                onPlayVideo={handlePlayVideo}
                watchedIds={watchedIds}
                getCoursePct={getCoursePct}
              />
            ))}
          </div>
        )}
      </div>

      {activeVideo && (
        <VideoPlayer video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </>
  );
}