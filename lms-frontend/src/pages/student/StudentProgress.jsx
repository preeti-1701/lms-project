import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useProgress } from "../../hooks/useProgress";

export default function StudentProgress() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  const { watchedIds, clearProgress, getCoursePct } = useProgress(user?.id);

  const fetchCourses = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data } = await api.get("/enrollments/my-courses/");
      setEnrollments(data);
    } catch {
      setError("Failed to load progress data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const allVideos    = enrollments.flatMap((e) => e.course_details?.videos ?? []);
  const totalVideos  = allVideos.length;
  const totalWatched = allVideos.filter((v) => watchedIds.has(v.id)).length;
  const overallPct   = totalVideos ? Math.round((totalWatched / totalVideos) * 100) : 0;
  const completed    = enrollments.filter((e) => getCoursePct(e.course_details?.videos ?? []) === 100).length;
  const inProgress   = enrollments.filter((e) => { const p = getCoursePct(e.course_details?.videos ?? []); return p > 0 && p < 100; }).length;

  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@300;400;500&display=swap');
        .pg-root { font-family:'DM Sans',sans-serif; max-width:720px; }
        .pg-title { font-family:'Playfair Display',serif; font-size:1.6rem; color:var(--text-primary); letter-spacing:-.02em; margin-bottom:.3rem; }
        .pg-sub   { font-size:.8125rem; color:var(--text-faint); font-weight:300; margin-bottom:2rem; }

        /* Big overall ring */
        .pg-hero { display:flex; align-items:center; gap:1.75rem; background:var(--bg-card); border:1px solid var(--border); border-radius:14px; padding:1.5rem 1.75rem; margin-bottom:1.5rem; flex-wrap:wrap; }
        .pg-ring-wrap { position:relative; width:96px; height:96px; flex-shrink:0; }
        .pg-ring-label { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
        .pg-ring-pct  { font-size:1.35rem; font-weight:500; color:var(--text-primary); line-height:1; }
        .pg-ring-done { font-size:.6rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:.07em; margin-top:.15rem; }
        .pg-hero-stats { display:flex; gap:1.5rem; flex-wrap:wrap; }
        .pg-hstat { display:flex; flex-direction:column; }
        .pg-hstat-num  { font-size:1.4rem; font-weight:500; line-height:1; margin-bottom:.2rem; }
        .pg-hstat-lbl  { font-size:.65rem; color:var(--text-faint); text-transform:uppercase; letter-spacing:.07em; }

        /* Per-course bars */
        .pg-section-title { font-size:.7rem; font-weight:500; letter-spacing:.08em; text-transform:uppercase; color:var(--text-faint); margin-bottom:.85rem; }
        .pg-course-list   { display:flex; flex-direction:column; gap:.6rem; margin-bottom:1.75rem; }
        .pg-course-row {
          background:var(--bg-card); border:1px solid var(--border); border-radius:11px;
          padding:.9rem 1.1rem; transition:border-color .2s;
        }
        .pg-course-row:hover { border-color:#2a2a2e; }
        .pg-course-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:.6rem; gap:.75rem; }
        .pg-course-name { font-size:.875rem; font-weight:500; color:#e0dfe0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .pg-course-right { display:flex; align-items:center; gap:.75rem; flex-shrink:0; }
        .pg-pct-label { font-size:.75rem; font-weight:500; font-variant-numeric:tabular-nums; }
        .pg-status-pill { font-size:.62rem; font-weight:500; padding:.18rem .55rem; border-radius:20px; border:1px solid; white-space:nowrap; }
        .pg-bar-track { height:5px; background:var(--bg-hover); border-radius:3px; overflow:hidden; }
        .pg-bar-fill  { height:100%; border-radius:3px; transition:width .6s ease; }
        .pg-video-count { font-size:.72rem; color:var(--text-faint); font-weight:300; margin-top:.45rem; }

        /* Skel */
        .pg-skel { background:var(--bg-hover); border-radius:5px; animation:pg-pulse 1.4s ease infinite; }
        @keyframes pg-pulse { 0%,100%{opacity:.4} 50%{opacity:.8} }

        /* Clear button */
        .pg-clear-btn { background:none; border:1px solid var(--border); border-radius:8px; color:var(--text-faint); font-family:'DM Sans',sans-serif; font-size:.75rem; padding:.45rem .9rem; cursor:pointer; transition:border-color .15s,color .15s; }
        .pg-clear-btn:hover { border-color:rgba(239,68,68,.3); color:#f87171; }
        .pg-confirm { background:rgba(239,68,68,.07); border:1px solid rgba(239,68,68,.2); border-radius:10px; padding:.85rem 1.1rem; display:flex; align-items:center; justify-content:space-between; gap:.75rem; flex-wrap:wrap; margin-top:.75rem; }
        .pg-confirm p { font-size:.8125rem; color:#f87171; }
        .pg-confirm-btns { display:flex; gap:.5rem; }
        .pg-yes { background:rgba(239,68,68,.1); border:1px solid rgba(239,68,68,.3); border-radius:7px; color:#f87171; font-family:'DM Sans',sans-serif; font-size:.75rem; padding:.35rem .85rem; cursor:pointer; }
        .pg-no  { background:var(--bg-hover); border:1px solid var(--border); border-radius:7px; color:var(--text-dim); font-family:'DM Sans',sans-serif; font-size:.75rem; padding:.35rem .85rem; cursor:pointer; }
      `}</style>

      <div className="pg-root">
        <div className="pg-title">Progress</div>
        <div className="pg-sub">Track your learning across all enrolled courses</div>

        {/* Hero overall stats */}
        {!loading && !error && (
          <div className="pg-hero">
            {/* Big ring */}
            <div className="pg-ring-wrap">
              <svg width={96} height={96} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={48} cy={48} r={40} fill="none" stroke="#1e1e22" strokeWidth={6} />
                <circle cx={48} cy={48} r={40} fill="none"
                  stroke={overallPct === 100 ? "#2dd4bf" : "#6366f1"}
                  strokeWidth={6}
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - overallPct / 100)}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset .8s ease, stroke .3s" }}
                />
              </svg>
              <div className="pg-ring-label">
                <span className="pg-ring-pct">{overallPct}%</span>
                <span className="pg-ring-done">overall</span>
              </div>
            </div>

            <div className="pg-hero-stats">
              {[
                { n: totalWatched, l: "Videos Watched", c: "#818cf8" },
                { n: totalVideos,  l: "Total Videos",   c: "#555"    },
                { n: completed,    l: "Completed",       c: "#2dd4bf" },
                { n: inProgress,   l: "In Progress",     c: "#ecaf4f" },
              ].map(({ n, l, c }) => (
                <div className="pg-hstat" key={l}>
                  <span className="pg-hstat-num" style={{ color: c }}>{n}</span>
                  <span className="pg-hstat-lbl">{l}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Per-course progress */}
        <div className="pg-section-title">Course Breakdown</div>

        {loading ? (
          <div className="pg-course-list">
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ background: "#111214", border: "1px solid #1c1c20", borderRadius: 11, padding: "1rem 1.1rem" }}>
                <div className="pg-skel" style={{ height: 14, width: "55%", marginBottom: 10 }} />
                <div className="pg-skel" style={{ height: 5, width: "100%" }} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={{ color: "#f87171", fontSize: ".875rem", padding: ".75rem 0" }}>{error}</div>
        ) : enrollments.length === 0 ? (
          <div style={{ color: "#333", fontSize: ".875rem", padding: "1.5rem 0", textAlign: "center" }}>
            No courses enrolled yet.
          </div>
        ) : (
          <div className="pg-course-list">
            {enrollments.map((e) => {
              const course  = e.course_details;
              const videos  = course.videos ?? [];
              const pct     = getCoursePct(videos);
              const watched = videos.filter((v) => watchedIds.has(v.id)).length;
              const isDone  = pct === 100;
              const started = pct > 0;

              const barColor = isDone
                ? "linear-gradient(90deg,#2dd4bf,#06b6d4)"
                : "linear-gradient(90deg,#6366f1,#818cf8)";

              const pillColor  = isDone ? "#2dd4bf" : started ? "#818cf8" : "#333";
              const pillBorder = isDone ? "rgba(45,212,191,.3)" : started ? "rgba(99,102,241,.3)" : "#252528";
              const pillBg     = isDone ? "rgba(45,212,191,.08)" : started ? "rgba(99,102,241,.08)" : "transparent";
              const pillLabel  = isDone ? "Completed" : started ? "In progress" : "Not started";

              return (
                <div key={e.id} className="pg-course-row">
                  <div className="pg-course-top">
                    <div className="pg-course-name">{course.title}</div>
                    <div className="pg-course-right">
                      <span className="pg-pct-label" style={{ color: pillColor }}>{pct}%</span>
                      <span className="pg-status-pill" style={{ color: pillColor, borderColor: pillBorder, background: pillBg }}>
                        {pillLabel}
                      </span>
                    </div>
                  </div>
                  <div className="pg-bar-track">
                    <div className="pg-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                  </div>
                  <div className="pg-video-count">
                    {watched} of {videos.length} video{videos.length !== 1 ? "s" : ""} watched
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Reset progress */}
        {!loading && totalWatched > 0 && (
          <div>
            <div className="pg-section-title" style={{ marginBottom: ".5rem" }}>Reset</div>
            <button className="pg-clear-btn" onClick={() => setConfirmClear(true)}>
              Clear all progress
            </button>
            {confirmClear && (
              <div className="pg-confirm">
                <p>This will clear all watched video history. This cannot be undone.</p>
                <div className="pg-confirm-btns">
                  <button className="pg-no"  onClick={() => setConfirmClear(false)}>Cancel</button>
                  <button className="pg-yes" onClick={() => { clearProgress(); setConfirmClear(false); }}>
                    Yes, clear
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}