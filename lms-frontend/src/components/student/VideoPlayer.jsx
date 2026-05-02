import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";

function getYouTubeId(url) {
  if (!url) return null;
  const patterns = [/[?&]v=([^&#]+)/, /youtu\.be\/([^?&#]+)/, /\/embed\/([^?&#]+)/];
  for (const p of patterns) { const m = url.match(p); if (m) return m[1]; }
  return null;
}

export default function VideoPlayer({ video, onClose }) {
  const { user } = useAuth();
  const wrapRef  = useRef(null);
  const wmRef    = useRef(null);
  const animRef  = useRef(null);
  const iframeRef = useRef(null);

  const [blocked,  setBlocked]  = useState(false); // screen capture detected
  const [tabHidden, setTabHidden] = useState(false); // tab lost focus

  const videoId       = getYouTubeId(video?.youtube_url);
  const watermarkText = `${user?.username} · ${user?.email}`;

  // ── 1. Moving watermark ───────────────────────────────────────────
  useEffect(() => {
    if (!wmRef.current || !wrapRef.current) return;
    let x = 10, y = 10, dx = 0.35, dy = 0.25;
    const move = () => {
      const wrap = wrapRef.current; const wm = wmRef.current;
      if (!wrap || !wm) return;
      const maxX = wrap.offsetWidth  - wm.offsetWidth  - 8;
      const maxY = wrap.offsetHeight - wm.offsetHeight - 8;
      x += dx; y += dy;
      if (x <= 4 || x >= maxX) dx = -dx;
      if (y <= 4 || y >= maxY) dy = -dy;
      x = Math.max(4, Math.min(x, maxX));
      y = Math.max(4, Math.min(y, maxY));
      wm.style.transform = `translate(${x}px, ${y}px)`;
      animRef.current = requestAnimationFrame(move);
    };
    animRef.current = requestAnimationFrame(move);
    return () => cancelAnimationFrame(animRef.current);
  }, [video]);

  // ── 2. Block right-click ──────────────────────────────────────────
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const block = (e) => e.preventDefault();
    el.addEventListener("contextmenu", block);
    return () => el.removeEventListener("contextmenu", block);
  }, []);

  // ── 3. Close on Escape ────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // ── 4. Intercept browser screen capture (getDisplayMedia) ─────────
  useEffect(() => {
    const originalGetDisplayMedia =
      navigator.mediaDevices?.getDisplayMedia?.bind(navigator.mediaDevices);
    if (!originalGetDisplayMedia) return;

    navigator.mediaDevices.getDisplayMedia = async (...args) => {
      // Block and warn
      setBlocked(true);
      // Throw so the browser capture dialog never opens
      throw new DOMException(
        "Screen capture is not allowed during video playback.",
        "NotAllowedError"
      );
    };

    return () => {
      if (originalGetDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia;
      }
    };
  }, []);

  // ── 5. Detect Screen Capture API usage (oncapturehandlechange) ────
  useEffect(() => {
    const handleCapture = () => setBlocked(true);
    // Modern Chrome supports this on video tracks
    if (typeof document.oncapturehandlechange !== "undefined") {
      document.addEventListener("capturehandlechange", handleCapture);
      return () => document.removeEventListener("capturehandlechange", handleCapture);
    }
  }, []);

  // ── 6. Pause when tab hidden / window loses focus ─────────────────
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) setTabHidden(true);
      else setTabHidden(false);
    };
    const onBlur  = () => setTabHidden(true);
    const onFocus = () => setTabHidden(false);

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur",  onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur",  onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // ── 7. Block screenshot keyboard shortcuts ────────────────────────
  useEffect(() => {
    const blockShortcuts = (e) => {
      // PrintScreen
      if (e.key === "PrintScreen") {
        e.preventDefault();
        setBlocked(true);
        setTimeout(() => setBlocked(false), 3000);
        return;
      }
      // Windows Snipping Tool: Win+Shift+S
      if (e.shiftKey && e.metaKey && e.key === "s") { e.preventDefault(); return; }
      if (e.shiftKey && e.metaKey && e.key === "S") { e.preventDefault(); return; }
      // Mac screenshot: Cmd+Shift+3/4/5
      if (e.metaKey && e.shiftKey && ["3","4","5"].includes(e.key)) { e.preventDefault(); return; }
      // Ctrl+Shift+I/J (devtools) and Ctrl+P (print)
      if (e.ctrlKey && e.shiftKey && ["i","I","j","J"].includes(e.key)) { e.preventDefault(); return; }
      if (e.ctrlKey && e.key === "p") { e.preventDefault(); return; }
      // Alt+PrtScn
      if (e.altKey && e.key === "PrintScreen") { e.preventDefault(); return; }
    };
    window.addEventListener("keydown", blockShortcuts, true);
    return () => window.removeEventListener("keydown", blockShortcuts, true);
  }, []);

  // Show blocked state
  const showOverlay = blocked || tabHidden;
  const overlayMsg  = blocked
    ? "⚠ Screen capture detected — video paused"
    : "▶ Click to resume — video paused while tab is inactive";

  return (
    <>
      <style>{`
        .vp-backdrop {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,.88);
          display: flex; align-items: center; justify-content: center;
          padding: 1.5rem; animation: vp-fadein .18s ease;
        }
        @keyframes vp-fadein { from{opacity:0} to{opacity:1} }

        .vp-modal {
          width: 100%; max-width: 860px;
          background: var(--bg-card);
          border-radius: 14px; border: 1px solid var(--border);
          overflow: hidden; animation: vp-slidein .2s ease;
        }
        @keyframes vp-slidein {
          from{opacity:0;transform:translateY(16px) scale(.98)}
          to{opacity:1;transform:translateY(0) scale(1)}
        }
        .vp-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: .9rem 1.25rem; border-bottom: 1px solid var(--border);
        }
        .vp-title {
          font-family: 'DM Sans', sans-serif; font-size: .9375rem; font-weight: 500;
          color: var(--text-secondary);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: calc(100% - 48px);
        }
        .vp-close {
          width: 30px; height: 30px; background: none;
          border: 1px solid var(--border-strong); border-radius: 7px;
          color: var(--text-label); cursor: pointer; font-size: 1rem;
          display: flex; align-items: center; justify-content: center;
          transition: border-color .15s, color .15s;
        }
        .vp-close:hover { border-color: var(--border-strong); color: var(--text-muted); }

        .vp-player-wrap {
          position: relative; aspect-ratio: 16/9;
          background: #000; user-select: none; -webkit-user-select: none;
        }
        .vp-iframe {
          position: absolute; inset: 0; width: 100%; height: 100%; border: none;
        }

        /* ── Security overlay ── */
        .vp-security-overlay {
          position: absolute; inset: 0; z-index: 10;
          background: rgba(0,0,0,.92);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 1rem;
          animation: vp-fadein .2s ease;
        }
        .vp-security-icon { font-size: 2.5rem; }
        .vp-security-msg {
          font-family: 'DM Sans', sans-serif;
          font-size: .9375rem; color: #f87171; font-weight: 400;
          text-align: center; max-width: 340px; line-height: 1.6;
        }
        .vp-security-sub {
          font-size: .775rem; color: #555; text-align: center; max-width: 320px; line-height: 1.6;
        }
        .vp-resume-btn {
          padding: .6rem 1.4rem;
          background: rgba(99,102,241,.12); border: 1px solid rgba(99,102,241,.3);
          border-radius: 9px; color: #818cf8;
          font-family: 'DM Sans', sans-serif; font-size: .875rem;
          cursor: pointer; transition: opacity .15s;
          margin-top: .25rem;
        }
        .vp-resume-btn:hover { opacity: .8; }

        /* ── Watermark ── */
        .vp-watermark {
          position: absolute; top: 0; left: 0; z-index: 5;
          pointer-events: none;
          font-family: 'DM Sans', sans-serif; font-size: .7rem; font-weight: 400;
          color: rgba(255,255,255,.22); background: rgba(0,0,0,.15);
          padding: .2rem .5rem; border-radius: 4px; white-space: nowrap;
          letter-spacing: .03em; will-change: transform;
        }

        .vp-footer {
          padding: .65rem 1.25rem; display: flex; align-items: center; gap: .5rem;
          flex-wrap: wrap;
        }
        .vp-warn { font-size: .7rem; color: var(--text-ghost); font-family: 'DM Sans', sans-serif; font-weight: 300; }
        .vp-warn-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--border-strong); flex-shrink: 0; }

        /* Security badges in footer */
        .vp-badges { display: flex; gap: .4rem; margin-left: auto; flex-wrap: wrap; }
        .vp-badge {
          font-size: .6rem; font-weight: 500; letter-spacing: .05em;
          padding: .15rem .5rem; border-radius: 20px; border: 1px solid;
        }
      `}</style>

      <div className="vp-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="vp-modal">
          <div className="vp-header">
            <span className="vp-title">{video?.title}</span>
            <button className="vp-close" onClick={onClose}>✕</button>
          </div>

          <div className="vp-player-wrap" ref={wrapRef} onContextMenu={(e) => e.preventDefault()}>
            {videoId ? (
              <iframe
                ref={iframeRef}
                className="vp-iframe"
                src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&controls=1${showOverlay ? "&autoplay=0" : ""}`}
                title={video?.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
                height:"100%", color:"#555", fontFamily:"DM Sans,sans-serif", fontSize:".875rem" }}>
                Invalid video URL
              </div>
            )}

            {/* Security overlay — shown when screen capture or tab hidden */}
            {showOverlay && (
              <div className="vp-security-overlay">
                <div className="vp-security-icon">{blocked ? "🚫" : "⏸"}</div>
                <div className="vp-security-msg">{overlayMsg}</div>
                <div className="vp-security-sub">
                  {blocked
                    ? "Screen recording is strictly prohibited. This activity has been flagged and your identity is watermarked on this video."
                    : "Return to this tab to continue watching."}
                </div>
                {tabHidden && !blocked && (
                  <button className="vp-resume-btn" onClick={() => setTabHidden(false)}>
                    ▶ Resume
                  </button>
                )}
                {blocked && (
                  <button className="vp-resume-btn" onClick={() => setBlocked(false)}>
                    Dismiss
                  </button>
                )}
              </div>
            )}

            {/* Moving watermark */}
            <div className="vp-watermark" ref={wmRef}>{watermarkText}</div>
          </div>

          <div className="vp-footer">
            <div className="vp-warn-dot" />
            <span className="vp-warn">
              Session recorded · Sharing or screen recording is prohibited
            </span>
            <div className="vp-badges">
              <span className="vp-badge" style={{ color:"#2dd4bf", borderColor:"rgba(45,212,191,.25)", background:"rgba(45,212,191,.07)" }}>
                🔒 Watermarked
              </span>
              <span className="vp-badge" style={{ color:"#818cf8", borderColor:"rgba(99,102,241,.25)", background:"rgba(99,102,241,.07)" }}>
                🛡 Protected
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}