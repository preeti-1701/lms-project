import { useEffect } from "react";

import { useTheme } from "../../context/ThemeContext";

export default function Modal({ title, onClose, children, maxWidth = "460px" }) {
  const { theme } = useTheme();
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      <style>{`
        .m-backdrop {
          position: fixed; inset: 0; z-index: 900;
          background: rgba(0,0,0,.75);
          display: flex; align-items: center; justify-content: center;
          padding: 1.5rem;
          animation: mfade .15s ease;
        }
        @keyframes mfade { from { opacity: 0 } to { opacity: 1 } }
        .m-box {
          width: 100%; max-width: ${maxWidth};
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
          animation: mslide .18s ease;
        }
        @keyframes mslide {
          from { opacity: 0; transform: translateY(14px) scale(.98) }
          to   { opacity: 1; transform: translateY(0)    scale(1)   }
        }
        .m-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--border);
        }
        .m-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.05rem; color: var(--text-primary); letter-spacing: -.01em;
        }
        .m-close {
          width: 28px; height: 28px;
          background: none; border: 1px solid var(--border); border-radius: 7px;
          color: var(--text-dim); cursor: pointer; font-size: .875rem;
          display: flex; align-items: center; justify-content: center;
          transition: border-color .15s, color .15s;
        }
        .m-close:hover { border-color: #444; color: #ccc; }
        .m-body { padding: 1.25rem; }
      `}</style>
      <div className="m-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="m-box">
          <div className="m-header">
            <span className="m-title">{title}</span>
            <button className="m-close" onClick={onClose}>✕</button>
          </div>
          <div className="m-body">{children}</div>
        </div>
      </div>
    </>
  );
}