import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function DashboardLayout({ navItems = [], accent = "#818cf8", accentBg = "rgba(99,102,241,.12)" }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate("/login", { replace: true });
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? "??";
  const isDark = theme === "dark";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@300;400;500&display=swap');

        .dl-root {
          display: flex; min-height: 100vh;
          background: var(--bg-root);
          font-family: 'DM Sans', sans-serif;
        }
        .dl-side {
          width: ${collapsed ? "64px" : "220px"};
          min-width: ${collapsed ? "64px" : "220px"};
          display: flex; flex-direction: column;
          background: var(--bg-sidebar);
          border-right: 1px solid var(--border);
          transition: width .22s ease, min-width .22s ease;
          overflow: hidden;
        }
        .dl-brand {
          display: flex; align-items: center; gap: .65rem;
          padding: 1.3rem 1rem .9rem;
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }
        .dl-brand-icon {
          width: 32px; height: 32px; flex-shrink: 0;
          border-radius: 8px;
          background: linear-gradient(135deg, #6366f1, #a78bfa);
          display: flex; align-items: center; justify-content: center; font-size: 15px;
        }
        .dl-brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 1rem; color: var(--text-primary);
          opacity: ${collapsed ? 0 : 1}; transition: opacity .15s;
        }
        .dl-nav { flex: 1; padding: 1rem 0; display: flex; flex-direction: column; gap: .2rem; }
        .dl-link {
          display: flex; align-items: center; gap: .75rem;
          padding: .65rem 1rem; margin: 0 .5rem;
          border-radius: 8px; color: var(--text-dim);
          text-decoration: none; font-size: .875rem; font-weight: 400;
          white-space: nowrap; transition: background .15s, color .15s;
        }
        .dl-link:hover { background: var(--bg-hover); color: var(--text-muted); }
        .dl-link.active { background: ${accentBg}; color: ${accent}; }
        .dl-link-icon { font-size: .8rem; flex-shrink: 0; width: 16px; text-align: center; }
        .dl-link-label { opacity: ${collapsed ? 0 : 1}; transition: opacity .15s; }

        .dl-bottom { border-top: 1px solid var(--border); padding: .9rem .75rem; }
        .dl-user {
          display: flex; align-items: center; gap: .65rem;
          padding: .5rem .35rem; margin-bottom: .4rem; white-space: nowrap;
        }
        .dl-avatar {
          width: 30px; height: 30px; flex-shrink: 0; border-radius: 50%;
          background: rgba(99,102,241,.18); border: 1px solid rgba(99,102,241,.3);
          display: flex; align-items: center; justify-content: center;
          font-size: .65rem; font-weight: 500; color: #818cf8; letter-spacing: .03em;
        }
        .dl-uinfo { opacity: ${collapsed ? 0 : 1}; transition: opacity .15s; overflow: hidden; }
        .dl-uname { font-size: .8rem; font-weight: 500; color: var(--text-body); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .dl-urole { font-size: .7rem; color: var(--text-faint); text-transform: capitalize; }
        .dl-logout {
          display: flex; align-items: center; gap: .75rem;
          width: 100%; padding: .6rem 1rem;
          background: none; border: 1px solid var(--border); border-radius: 8px;
          color: var(--text-dim); font-family: 'DM Sans', sans-serif; font-size: .8rem;
          cursor: pointer; white-space: nowrap; transition: border-color .15s, color .15s;
        }
        .dl-logout:hover { border-color: rgba(239,68,68,.3); color: #f87171; }
        .dl-logout-label { opacity: ${collapsed ? 0 : 1}; transition: opacity .15s; }

        .dl-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .dl-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: .9rem 1.75rem;
          border-bottom: 1px solid var(--border);
          background: var(--bg-topbar);
        }
        .dl-topbar-left { display: flex; align-items: center; gap: .75rem; }
        .dl-collapse-btn {
          background: none; border: 1px solid var(--border); border-radius: 7px;
          width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-dim); font-size: .75rem;
          transition: border-color .15s, color .15s;
        }
        .dl-collapse-btn:hover { border-color: var(--border-strong); color: var(--text-muted); }

        .dl-topbar-right { display: flex; align-items: center; gap: .6rem; flex-wrap: wrap; }
        .dl-greeting { font-size: .8125rem; color: var(--text-faint); font-weight: 300; }
        .dl-greeting strong { color: var(--text-muted); font-weight: 400; }

        .dl-id-badge {
          display: flex; align-items: center; gap: .35rem;
          font-size: .7rem; padding: .22rem .7rem;
          border-radius: 20px; border: 1px solid var(--border-strong);
          background: var(--bg-hover); cursor: default; user-select: all;
        }
        .dl-id-label { font-size: .6rem; text-transform: uppercase; letter-spacing: .08em; color: var(--text-faint); }
        .dl-id-value { color: var(--text-muted); font-weight: 500; font-variant-numeric: tabular-nums; }

        .dl-role-badge {
          font-size: .65rem; font-weight: 500; letter-spacing: .07em;
          text-transform: uppercase; padding: .2rem .55rem;
          border-radius: 20px; border: 1px solid;
          border-color: ${accent}44; color: ${accent}; background: ${accentBg};
        }

        /* ── Theme Toggle Button ── */
        .dl-theme-btn {
          width: 32px; height: 32px;
          background: var(--bg-hover); border: 1px solid var(--border);
          border-radius: 8px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: .9rem;
          transition: background .2s, border-color .2s, transform .15s;
          flex-shrink: 0;
        }
        .dl-theme-btn:hover { background: var(--bg-card); border-color: var(--border-strong); transform: scale(1.05); }

        .dl-content { flex: 1; padding: 2rem 1.75rem; overflow-y: auto; background: var(--bg-root); }

        @media (max-width: 640px) { .dl-side { display: none; } }
      `}</style>

      <div className="dl-root">
        <aside className="dl-side">
          <div className="dl-brand">
            <div className="dl-brand-icon">📚</div>
            <span className="dl-brand-name">LearnHub</span>
          </div>
          <nav className="dl-nav">
            {navItems.map(({ to, icon, label }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `dl-link${isActive ? " active" : ""}`}>
                <span className="dl-link-icon">{icon}</span>
                <span className="dl-link-label">{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="dl-bottom">
            <div className="dl-user">
              <div className="dl-avatar">{initials}</div>
              <div className="dl-uinfo">
                <div className="dl-uname">{user?.username}</div>
                <div className="dl-urole">{user?.role}</div>
              </div>
            </div>
            <button className="dl-logout" onClick={handleLogout} disabled={loggingOut}>
              <span>↩</span>
              <span className="dl-logout-label">{loggingOut ? "Signing out…" : "Sign Out"}</span>
            </button>
          </div>
        </aside>

        <div className="dl-main">
          <header className="dl-topbar">
            <div className="dl-topbar-left">
              <button className="dl-collapse-btn" onClick={() => setCollapsed(c => !c)} aria-label="Toggle sidebar">
                {collapsed ? "▶" : "◀"}
              </button>
            </div>
            <div className="dl-topbar-right">
              <span className="dl-greeting">
                Welcome, <strong>{user?.username}</strong>
              </span>
              {(user?.role === "student" || user?.role === "trainer") && user?.id && (
                <span className="dl-id-badge" title={user.role === "trainer" ? "Your Trainer ID" : "Your Student ID — share with trainer to enroll"}>
                  <span className="dl-id-label">ID</span>
                  <span className="dl-id-value">{user.id}</span>
                </span>
              )}
              <span className="dl-role-badge">{user?.role}</span>

              {/* 🌙 / ☀️ Theme Toggle */}
              <button
                className="dl-theme-btn"
                onClick={toggleTheme}
                title={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
                aria-label="Toggle theme"
              >
                {isDark ? "☀️" : "🌙"}
              </button>
            </div>
          </header>
          <main className="dl-content">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}