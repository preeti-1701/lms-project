import { useEffect, useRef, useState } from "react";
import API from "../services/api";

export default function VideoPlayer({ url, user, videoId, onProgressSaved }) {
  const containerRef = useRef(null);
  const [wmPos, setWmPos] = useState({ x: 10, y: 10 });
  const [showWarning, setShowWarning] = useState(false);
  const watchedRef = useRef(false);
  const secondsRef = useRef(0);

  const getVideoId = (u) => {
    try {
      if (u.includes("watch?v=")) return u.split("v=")[1].split("&")[0];
      if (u.includes("youtu.be/")) return u.split("youtu.be/")[1].split("?")[0];
      return "";
    } catch { return ""; }
  };

  const embedUrl = `https://www.youtube.com/embed/${getVideoId(url)}?modestbranding=1&controls=1&rel=0`;

  // Right-click block
  useEffect(() => {
    const block = (e) => e.preventDefault();
    document.addEventListener("contextmenu", block);
    return () => document.removeEventListener("contextmenu", block);
  }, []);

  // Keyboard deterrence
  useEffect(() => {
    const onKey = (e) => {
      if (
        e.key === "PrintScreen" ||
        (e.ctrlKey && e.key === "p") ||
        (e.ctrlKey && e.shiftKey && ["i","I","s","S"].includes(e.key)) ||
        e.key === "F12"
      ) {
        e.preventDefault();
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Moving watermark
  useEffect(() => {
    const move = () => {
      const el = containerRef.current;
      if (!el) return;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      setWmPos({
        x: Math.max(4, Math.random() * (w - 230)),
        y: Math.max(4, Math.random() * (h - 40)),
      });
    };
    move();
    const id = setInterval(move, 4000);
    return () => clearInterval(id);
  }, []);

  // ✅ Progress saving — mark watched:true after 30s, refresh parent
  useEffect(() => {
    watchedRef.current = false;
    secondsRef.current = 0;

    const interval = setInterval(async () => {
      secondsRef.current += 5;
      // mark as watched after 30 seconds of viewing
      const shouldMarkWatched = secondsRef.current >= 30 && !watchedRef.current;

      try {
        await API.post("/progress", {
          videoId,
          currentTime: secondsRef.current,
          watched: shouldMarkWatched || watchedRef.current,
        });

        if (shouldMarkWatched) {
          watchedRef.current = true;
          // notify student dashboard to reload progress
          if (onProgressSaved) onProgressSaved();
        }
      } catch (err) {
        // silent fail
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [videoId]);

  const timestamp = new Date().toLocaleString("en-IN", {
    hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short",
  });

  return (
    <div
      ref={containerRef}
      className="relative rounded-xl overflow-hidden"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      {showWarning && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 rounded-xl">
          <div className="text-center px-6 py-4 bg-red-900/90 border border-red-500 rounded-xl">
            <p className="text-red-300 text-lg font-bold">⚠️ Screenshot Detected</p>
            <p className="text-red-200 text-sm mt-1">This content is protected. Unauthorized reproduction is prohibited.</p>
          </div>
        </div>
      )}
      <iframe className="w-full h-[420px] rounded-xl" src={embedUrl} title="video" allowFullScreen />
      <div
        className="absolute pointer-events-none transition-all duration-1000 ease-in-out"
        style={{ left: wmPos.x, top: wmPos.y }}
      >
        <div className="bg-black/25 rounded px-2 py-1">
          <p className="text-white text-xs opacity-60 font-mono whitespace-nowrap">
            🔒 {user} · {timestamp}
          </p>
        </div>
      </div>
      <div className="absolute bottom-2 right-2 text-white text-xs opacity-25 pointer-events-none font-mono">
        LMS-SECURE
      </div>
    </div>
  );
}