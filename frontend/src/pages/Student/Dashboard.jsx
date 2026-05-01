import { useEffect, useState, useCallback, useRef } from "react";
import API from "../../services/api";
import VideoPlayer from "../../components/VideoPlayer";

export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [error, setError] = useState("");
  const [sessionKilled, setSessionKilled] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeCourse, setActiveCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSecurityBanner, setShowSecurityBanner] = useState(true);
  const [pageLoaded, setPageLoaded] = useState(false);
  const mainRef = useRef(null);

  const handleSessionExpired = useCallback(() => {
    localStorage.removeItem("token");
    setSessionKilled(true);
  }, []);

  const loadData = async () => {
    try {
      setError("");
      const [meRes, enrollRes] = await Promise.all([
        API.get("/auth/me").catch(() => ({ data: null })),
        API.get("/enrollments/me"),
      ]);
      setUser(meRes?.data);
      setEnrollments(enrollRes?.data || []);
      setTimeout(() => setPageLoaded(true), 100);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) handleSessionExpired();
      else setError("Failed to load your courses. Please try again.");
    }
  };

  useEffect(() => {
    loadData();
    const poll = setInterval(async () => {
      try { await API.get("/auth/me"); }
      catch (err) { if (err?.response?.status === 401) handleSessionExpired(); }
    }, 15000);
    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    if (!sessionKilled) return;
    if (countdown <= 0) { window.location.href = "/"; return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [sessionKilled, countdown]);

  const getVideoId = (url) => {
    if (!url) return "";
    if (url.includes("v=")) return url.split("v=")[1]?.split("&")[0];
    if (url.includes("youtu.be/")) return url.split("youtu.be/")[1];
    return "";
  };

  const totalVideos = enrollments.reduce((a, e) => a + (e.course?.videos?.length || 0), 0);
  const totalWatched = enrollments.reduce((a, e) =>
    a + (e.course?.videos || []).filter(v => v?.progress?.length > 0).length, 0);
  const overallPct = totalVideos ? Math.round((totalWatched / totalVideos) * 100) : 0;
  const username = user?.name || "Student";
  const initial = username.charAt(0).toUpperCase();

  if (sessionKilled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #020617 0%, #0f172a 50%, #1a0a2e 100%)" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');
          .kill-pulse { animation: killPulse 2s ease-in-out infinite; }
          @keyframes killPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 50% { box-shadow: 0 0 0 20px rgba(239,68,68,0); } }
        `}</style>
        <div className="text-center max-w-sm w-full" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          <div className="kill-pulse w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Session Terminated</h1>
          <p className="text-gray-400 mb-8 text-sm leading-relaxed">Your session was ended by an administrator. Contact your trainer if you think this is a mistake.</p>
          <div className="relative w-16 h-16 mx-auto mb-6">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#1e293b" strokeWidth="4" />
              <circle cx="32" cy="32" r="28" fill="none" stroke="#ef4444" strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - countdown / 5)}`}
                strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-xl font-bold">{countdown}</span>
            </div>
          </div>
          <button onClick={() => { window.location.href = "/"; }}
            className="w-full py-3 rounded-xl text-sm font-medium text-white transition-all"
            style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        * { box-sizing: border-box; }

        .dash-root {
          font-family: 'DM Sans', sans-serif;
          background: #030712;
          min-height: 100vh;
          color: #f1f5f9;
        }

        /* Animated background */
        .dash-bg {
          position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none;
        }
        .dash-bg::before {
          content: '';
          position: absolute;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%);
          top: -100px; left: -100px;
          animation: bgFloat1 20s ease-in-out infinite;
        }
        .dash-bg::after {
          content: '';
          position: absolute;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%);
          bottom: -100px; right: -100px;
          animation: bgFloat2 25s ease-in-out infinite reverse;
        }
        @keyframes bgFloat1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(80px,60px) scale(1.1); } }
        @keyframes bgFloat2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-60px,-40px) scale(1.08); } }

        /* Navbar */
        .dash-nav {
          position: sticky; top: 0; z-index: 50;
          background: rgba(3,7,18,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 0 1.5rem;
          height: 60px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .nav-brand {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.1rem;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #10b981, #34d399);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .nav-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.8rem;
          color: white; flex-shrink: 0;
          box-shadow: 0 0 0 2px rgba(16,185,129,0.3);
        }
        .logout-btn {
          padding: 0.4rem 1rem;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 500;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          color: #fca5a5;
          cursor: pointer;
          transition: all 0.2s;
        }
        .logout-btn:hover { background: rgba(239,68,68,0.2); color: #fff; }

        /* Security banner */
        .sec-banner {
          background: linear-gradient(90deg, rgba(161,98,7,0.15), rgba(161,98,7,0.08));
          border-bottom: 1px solid rgba(234,179,8,0.15);
          padding: 0.6rem 1.5rem;
          display: flex; align-items: center; justify-content: space-between;
          font-size: 0.75rem; color: #fbbf24;
          animation: slideDown 0.4s ease;
        }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

        /* Sidebar */
        .sidebar {
          width: 280px; flex-shrink: 0;
          background: rgba(15,23,42,0.6);
          border-right: 1px solid rgba(255,255,255,0.05);
          overflow-y: auto; height: 100%;
          scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent;
        }

        /* Stats strip */
        .stats-strip {
          padding: 1rem 1rem 0.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .stat-row {
          display: flex; gap: 0.5rem; margin-bottom: 0.75rem;
        }
        .stat-chip {
          flex: 1; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 0.5rem 0.6rem; text-align: center;
        }
        .stat-chip .val {
          font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 700;
          color: #10b981;
        }
        .stat-chip .lbl { font-size: 0.6rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 1px; }

        /* Overall progress */
        .overall-bar {
          height: 4px; background: rgba(255,255,255,0.08); border-radius: 99px; overflow: hidden; margin-top: 0.5rem;
        }
        .overall-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #34d399);
          border-radius: 99px;
          transition: width 1s cubic-bezier(0.4,0,0.2,1);
        }

        /* Course button */
        .course-btn {
          width: 100%; text-align: left;
          padding: 0.75rem 0.85rem;
          border-radius: 10px;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s;
          color: #f1f5f9;
        }
        .course-btn:hover { background: rgba(255,255,255,0.04); }
        .course-btn.active {
          background: rgba(16,185,129,0.08);
          border-color: rgba(16,185,129,0.2);
        }
        .course-title { font-size: 0.82rem; font-weight: 500; color: #f1f5f9; }
        .course-meta { font-size: 0.7rem; color: #64748b; margin-top: 2px; }
        .course-bar { height: 2px; background: rgba(255,255,255,0.07); border-radius: 99px; margin-top: 6px; overflow: hidden; }
        .course-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, #10b981, #34d399); transition: width 0.8s ease; }

        /* Video item in sidebar */
        .vid-item {
          width: 100%; text-align: left;
          display: flex; align-items: center; gap: 8px;
          padding: 0.45rem 0.75rem;
          border-radius: 8px;
          font-size: 0.75rem;
          color: #64748b;
          cursor: pointer;
          background: transparent;
          border: none;
          transition: all 0.15s;
        }
        .vid-item:hover { background: rgba(255,255,255,0.04); color: #94a3b8; }
        .vid-item.active { background: rgba(99,102,241,0.1); color: #a5b4fc; }
        .vid-dot {
          width: 18px; height: 18px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; flex-shrink: 0;
          background: rgba(255,255,255,0.06);
          color: #475569;
        }
        .vid-dot.watched { background: rgba(16,185,129,0.15); color: #10b981; }

        /* Main content */
        .main-content {
          flex: 1; overflow-y: auto; padding: 2rem;
          scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent;
        }

        /* Welcome screen */
        .welcome-screen {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          height: 100%; text-align: center;
          animation: fadeIn 0.6s ease;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        .welcome-icon {
          width: 80px; height: 80px; border-radius: 24px;
          background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05));
          border: 1px solid rgba(16,185,129,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 2.5rem; margin-bottom: 1.5rem;
        }

        /* Course header */
        .course-header {
          margin-bottom: 1.5rem;
          animation: fadeIn 0.4s ease;
        }
        .course-label {
          font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em;
          color: #10b981; font-weight: 600; margin-bottom: 0.4rem;
        }
        .course-name {
          font-family: 'Syne', sans-serif;
          font-size: 1.6rem; font-weight: 700;
          color: #f8fafc; letter-spacing: -0.02em; line-height: 1.2;
        }

        /* Protected notice */
        .protect-notice {
          display: flex; align-items: center; gap: 0.6rem;
          background: rgba(239,68,68,0.06);
          border: 1px solid rgba(239,68,68,0.15);
          border-radius: 10px;
          padding: 0.6rem 1rem;
          margin-bottom: 1.25rem;
          font-size: 0.75rem; color: #fca5a5;
        }

        /* Video grid */
        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 0.75rem;
          margin-top: 1.5rem;
          animation: fadeIn 0.5s ease;
        }
        .vid-card {
          border-radius: 10px; overflow: hidden;
          cursor: pointer;
          border: 1.5px solid rgba(255,255,255,0.06);
          background: rgba(15,23,42,0.8);
          transition: all 0.2s;
        }
        .vid-card:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.12); }
        .vid-card.active-vid { border-color: #10b981; box-shadow: 0 0 0 1px rgba(16,185,129,0.3); }
        .vid-thumb { width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block; }
        .vid-info { padding: 0.5rem 0.6rem; }
        .vid-num { font-size: 0.7rem; color: #94a3b8; }
        .vid-watched { font-size: 0.65rem; color: #10b981; margin-top: 1px; }

        /* Section label */
        .section-label {
          font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em;
          color: #475569; font-weight: 600; margin-bottom: 0.75rem;
        }

        /* Error */
        .err-bar {
          margin: 1rem 1.5rem 0;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px; padding: 0.75rem 1rem;
          display: flex; justify-content: space-between; align-items: center;
          font-size: 0.8rem; color: #fca5a5;
        }

        /* Page load animation */
        .page-enter { animation: pageEnter 0.5s ease forwards; }
        @keyframes pageEnter { from { opacity: 0; } to { opacity: 1; } }

        /* Mobile sidebar overlay */
        .sidebar-overlay {
          position: fixed; inset: 0; z-index: 25;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
        }
        .sidebar-mobile {
          position: fixed; left: 0; top: 0; bottom: 0; z-index: 30;
          width: 280px;
        }

        @media (max-width: 768px) {
          .main-content { padding: 1rem; }
          .course-name { font-size: 1.2rem; }
        }
      `}</style>

      <div className={`dash-root ${pageLoaded ? "page-enter" : "opacity-0"}`}>
        <div className="dash-bg" />

        {/* NAVBAR */}
        <nav className="dash-nav" style={{ position: "relative", zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.35rem 0.6rem", color: "#94a3b8", cursor: "pointer", fontSize: "1rem" }}>
              ☰
            </button>
            <span className="nav-brand">⚡ LMS</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div className="nav-avatar">{initial}</div>
              <span style={{ fontSize: "0.8rem", color: "#94a3b8" }} className="hidden sm:block">
                {username}
              </span>
            </div>
            <button className="logout-btn" onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}>
              Sign out
            </button>
          </div>
        </nav>

        {/* SECURITY BANNER */}
        {showSecurityBanner && (
          <div className="sec-banner" style={{ position: "relative", zIndex: 40 }}>
            <span>🔒 <strong>Content Protection Active</strong> — Recording, screenshots & sharing are strictly prohibited and monitored.</span>
            <button onClick={() => setShowSecurityBanner(false)}
              style={{ background: "none", border: "none", color: "#fbbf24", cursor: "pointer", fontSize: "1rem", lineHeight: 1, opacity: 0.7 }}>✕</button>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="err-bar" style={{ position: "relative", zIndex: 40 }}>
            <span>⚠️ {error}</span>
            <button onClick={loadData} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: "0.75rem", textDecoration: "underline" }}>Retry</button>
          </div>
        )}

        {/* BODY */}
        <div style={{ display: "flex", height: "calc(100vh - 60px)", position: "relative", zIndex: 10, overflow: "hidden" }}>

          {/* MOBILE OVERLAY */}
          {sidebarOpen && (
            <>
              <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
              <div className="sidebar-mobile">
                <SidebarContent
                  enrollments={enrollments}
                  activeCourse={activeCourse}
                  activeVideo={activeVideo}
                  overallPct={overallPct}
                  totalWatched={totalWatched}
                  totalVideos={totalVideos}
                  setActiveCourse={setActiveCourse}
                  setActiveVideo={setActiveVideo}
                  setSidebarOpen={setSidebarOpen}
                />
              </div>
            </>
          )}

          {/* DESKTOP SIDEBAR */}
          <div className="hidden md:block sidebar">
            <SidebarContent
              enrollments={enrollments}
              activeCourse={activeCourse}
              activeVideo={activeVideo}
              overallPct={overallPct}
              totalWatched={totalWatched}
              totalVideos={totalVideos}
              setActiveCourse={setActiveCourse}
              setActiveVideo={setActiveVideo}
              setSidebarOpen={setSidebarOpen}
            />
          </div>

          {/* MAIN */}
          <div className="main-content" ref={mainRef}>
            {!activeCourse ? (
              <div className="welcome-screen">
                <div className="welcome-icon">🎓</div>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#f8fafc", marginBottom: "0.5rem" }}>
                  Welcome back, {username}
                </h2>
                <p style={{ color: "#475569", fontSize: "0.875rem", maxWidth: "280px", lineHeight: 1.6 }}>
                  {enrollments.length > 0
                    ? `You have ${enrollments.length} course${enrollments.length > 1 ? "s" : ""} waiting. Pick one to continue.`
                    : "No courses assigned yet. Check back soon."}
                </p>
                {enrollments.length > 0 && (
                  <div style={{ marginTop: "2rem", display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
                    {enrollments.slice(0, 3).map((e) => (
                      <button key={e.id}
                        onClick={() => { setActiveCourse(e.course); setActiveVideo(e.course?.videos?.[0] || null); }}
                        style={{ padding: "0.5rem 1rem", borderRadius: "8px", fontSize: "0.78rem", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#34d399", cursor: "pointer" }}>
                        {e.course?.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ animation: "fadeIn 0.4s ease" }}>
                <div className="course-header">
                  <div className="course-label">Now Learning</div>
                  <div className="course-name">{activeCourse.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.75rem" }}>
                    <div style={{ flex: 1, height: "3px", background: "rgba(255,255,255,0.07)", borderRadius: "99px", overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: `${activeCourse.videos?.length ? Math.round((activeCourse.videos.filter(v => v?.progress?.length > 0).length / activeCourse.videos.length) * 100) : 0}%`,
                        background: "linear-gradient(90deg, #10b981, #34d399)",
                        borderRadius: "99px",
                        transition: "width 1s ease"
                      }} />
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: 600, flexShrink: 0 }}>
                      {activeCourse.videos?.length ? Math.round((activeCourse.videos.filter(v => v?.progress?.length > 0).length / activeCourse.videos.length) * 100) : 0}% complete
                    </span>
                  </div>
                </div>

                <div className="protect-notice">
                  <span style={{ flexShrink: 0 }}>🛡️</span>
                  <span>Protected content — Do not record, share, or screenshot. All access is logged and watermarked.</span>
                </div>

                {activeVideo ? (
                  <VideoPlayer
                    url={activeVideo.youtubeUrl}
                    user={username}
                    videoId={activeVideo.id}
                    onProgressSaved={loadData}
                  />
                ) : (
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", height: "200px", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontSize: "0.875rem" }}>
                    No videos in this course yet
                  </div>
                )}

                {activeCourse.videos?.length > 0 && (
                  <div style={{ marginTop: "2rem" }}>
                    <div className="section-label">Course Videos — {activeCourse.videos.length} lessons</div>
                    <div className="video-grid">
                      {activeCourse.videos.map((v, idx) => {
                        const isWatched = v?.progress?.length > 0;
                        const isActive = activeVideo?.id === v.id;
                        return (
                          <button key={v.id} onClick={() => setActiveVideo(v)}
                            className={`vid-card ${isActive ? "active-vid" : ""}`}
                            style={{ border: "none", textAlign: "left", width: "100%" }}>
                            <div style={{ position: "relative" }}>
                              <img
                                src={`https://img.youtube.com/vi/${getVideoId(v.youtubeUrl)}/mqdefault.jpg`}
                                className="vid-thumb" alt={`Lesson ${idx + 1}`} />
                              {isWatched && (
                                <div style={{ position: "absolute", top: "6px", right: "6px", width: "20px", height: "20px", borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "white", fontWeight: 700 }}>
                                  ✓
                                </div>
                              )}
                              {isActive && (
                                <div style={{ position: "absolute", inset: 0, background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(16,185,129,0.9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "white" }}>▶</div>
                                </div>
                              )}
                            </div>
                            <div className="vid-info">
                              <div className="vid-num">Lesson {idx + 1}</div>
                              {isWatched && <div className="vid-watched">✓ Completed</div>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function SidebarContent({ enrollments, activeCourse, activeVideo, overallPct, totalWatched, totalVideos, setActiveCourse, setActiveVideo, setSidebarOpen }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "rgba(3,7,18,0.95)", borderRight: "1px solid rgba(255,255,255,0.05)" }}>

      {/* Stats */}
      <div className="stats-strip">
        <div className="stat-row">
          <div className="stat-chip">
            <div className="val">{enrollments.length}</div>
            <div className="lbl">Courses</div>
          </div>
          <div className="stat-chip">
            <div className="val">{totalWatched}</div>
            <div className="lbl">Watched</div>
          </div>
          <div className="stat-chip">
            <div className="val" style={{ color: overallPct === 100 ? "#10b981" : overallPct > 0 ? "#6366f1" : "#10b981" }}>{overallPct}%</div>
            <div className="lbl">Progress</div>
          </div>
        </div>
        <div style={{ fontSize: "0.65rem", color: "#334155", marginBottom: "0.4rem", display: "flex", justifyContent: "space-between" }}>
          <span>Overall Progress</span>
          <span>{totalWatched}/{totalVideos} videos</span>
        </div>
        <div className="overall-bar">
          <div className="overall-fill" style={{ width: `${overallPct}%` }} />
        </div>
      </div>

      {/* Course list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem", scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.08) transparent" }}>
        <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#334155", fontWeight: 600, marginBottom: "0.5rem", padding: "0 0.25rem" }}>
          My Courses
        </div>

        {enrollments.length === 0 && (
          <p style={{ fontSize: "0.78rem", color: "#334155", padding: "0.5rem 0.25rem" }}>No courses assigned yet.</p>
        )}

        {enrollments.map((enrollment) => {
          const course = enrollment.course;
          const videos = course?.videos || [];
          const watched = videos.filter((v) => v?.progress?.length > 0).length;
          const pct = videos.length ? Math.round((watched / videos.length) * 100) : 0;
          const isActive = activeCourse?.id === course?.id;

          return (
            <div key={enrollment.id} style={{ marginBottom: "0.25rem" }}>
              <button className={`course-btn ${isActive ? "active" : ""}`}
                onClick={() => { setActiveCourse(course); setActiveVideo(videos[0] || null); setSidebarOpen(false); }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                  <div className="course-title">{course?.title}</div>
                  <span style={{ fontSize: "0.65rem", color: pct === 100 ? "#10b981" : "#475569", fontWeight: 600, flexShrink: 0 }}>{pct}%</span>
                </div>
                <div className="course-meta">{videos.length} lesson{videos.length !== 1 ? "s" : ""}</div>
                <div className="course-bar">
                  <div className="course-fill" style={{ width: `${pct}%` }} />
                </div>
              </button>

              {isActive && videos.length > 0 && (
                <div style={{ marginLeft: "0.5rem", marginTop: "0.25rem", marginBottom: "0.25rem" }}>
                  {videos.map((v, idx) => {
                    const isWatched = v?.progress?.length > 0;
                    const isCurrentVideo = activeVideo?.id === v.id;
                    return (
                      <button key={v.id} className={`vid-item ${isCurrentVideo ? "active" : ""}`}
                        onClick={() => setActiveVideo(v)}>
                        <div className={`vid-dot ${isWatched ? "watched" : ""}`}>
                          {isWatched ? "✓" : idx + 1}
                        </div>
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          Lesson {idx + 1}
                        </span>
                        {isCurrentVideo && <span style={{ color: "#6366f1", fontSize: "8px" }}>▶</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}