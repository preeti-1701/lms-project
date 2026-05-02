import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_REDIRECT = {
  admin: "/admin/dashboard",
  trainer: "/trainer/dashboard",
  student: "/student/dashboard",
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.username, form.password);
      navigate(ROLE_REDIRECT[user.role] || "/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lms-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: var(--bg-root);
          font-family: 'DM Sans', sans-serif;
        }

        /* ── LEFT PANEL ── */
        .panel-left {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 3.5rem;
          overflow: hidden;
          background: var(--bg-sidebar);
        }
        .panel-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 55% at 20% 30%, rgba(99,102,241,.18) 0%, transparent 65%),
            radial-gradient(ellipse 50% 40% at 80% 70%, rgba(236,175,79,.10) 0%, transparent 60%);
          pointer-events: none;
        }
        .grid-lines {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .brand-mark {
          position: absolute;
          top: 3.5rem;
          left: 3.5rem;
          display: flex;
          align-items: center;
          gap: .75rem;
        }
        .brand-icon {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #a78bfa);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }
        .brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          color: var(--text-primary);
          letter-spacing: -.01em;
        }
        .panel-left-copy {
          position: relative;
          z-index: 1;
        }
        .panel-left-copy h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 3.5vw, 3rem);
          color: var(--text-primary);
          line-height: 1.15;
          letter-spacing: -.02em;
          margin-bottom: 1.25rem;
        }
        .panel-left-copy h1 em {
          font-style: italic;
          color: #ecaf4f;
        }
        .panel-left-copy p {
          font-size: .9375rem;
          color: var(--text-muted);
          line-height: 1.7;
          max-width: 340px;
          font-weight: 300;
        }
        .dots-row {
          display: flex;
          gap: .5rem;
          margin-top: 2.5rem;
        }
        .dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #2a2a2e;
        }
        .dot.active {
          background: #6366f1;
          box-shadow: 0 0 8px #6366f180;
        }

        /* ── RIGHT PANEL ── */
        .panel-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          background: var(--bg-root);
        }
        .form-card {
          width: 100%;
          max-width: 400px;
        }
        .form-header {
          margin-bottom: 2.5rem;
        }
        .form-header h2 {
          font-family: 'Playfair Display', serif;
          font-size: 1.9rem;
          color: var(--text-primary);
          letter-spacing: -.02em;
          margin-bottom: .5rem;
        }
        .form-header p {
          font-size: .875rem;
          color: var(--text-dim);
          font-weight: 300;
        }

        .field {
          margin-bottom: 1.25rem;
        }
        .field label {
          display: block;
          font-size: .75rem;
          font-weight: 500;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: var(--text-label);
          margin-bottom: .5rem;
        }
        .input-wrap {
          position: relative;
        }
        .input-wrap input {
          width: 100%;
          padding: .875rem 1rem;
          background: var(--bg-input);
          border: 1px solid var(--border-strong);
          border-radius: 10px;
          color: var(--text-primary);
          font-family: 'DM Sans', sans-serif;
          font-size: .9375rem;
          font-weight: 300;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .input-wrap input::placeholder { color: var(--text-ghost); }
        .input-wrap input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,.12);
        }
        .toggle-pass {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-dim);
          padding: 0;
          line-height: 1;
          font-size: 1rem;
          transition: color .2s;
        }
        .toggle-pass:hover { color: #aaa; }

        .error-box {
          display: flex;
          align-items: center;
          gap: .6rem;
          background: rgba(239,68,68,.08);
          border: 1px solid rgba(239,68,68,.25);
          border-radius: 8px;
          padding: .75rem 1rem;
          margin-bottom: 1.25rem;
          font-size: .85rem;
          color: #f87171;
        }

        .btn-login {
          width: 100%;
          padding: .9375rem;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: .9375rem;
          font-weight: 500;
          cursor: pointer;
          transition: opacity .2s, transform .15s;
          position: relative;
          overflow: hidden;
          margin-top: .5rem;
        }
        .btn-login:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
        .btn-login:active:not(:disabled) { transform: translateY(0); }
        .btn-login:disabled { opacity: .5; cursor: not-allowed; }
        .btn-login .spinner {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin .6s linear infinite;
          vertical-align: middle;
          margin-right: .5rem;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.75rem 0 1.25rem;
          color: #333;
          font-size: .75rem;
          letter-spacing: .05em;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border-faint);
        }

        .roles-hint {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: .5rem;
        }
        .role-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: .25rem;
          padding: .625rem .5rem;
          background: var(--bg-hover2);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: .7rem;
          font-weight: 500;
          letter-spacing: .03em;
        }
        .role-pill .icon { font-size: 1rem; }
        .role-pill .label { color: var(--text-dim); text-transform: uppercase; }

        @media (max-width: 768px) {
          .lms-root { grid-template-columns: 1fr; }
          .panel-left { display: none; }
          .panel-right { padding: 2rem 1.5rem; }
        }
      `}</style>

      <div className="lms-root">
        {/* LEFT */}
        <div className="panel-left">
          <div className="grid-lines" />
          <div className="brand-mark">
            <div className="brand-icon">📚</div>
            <span className="brand-name">LearnHub</span>
          </div>
          <div className="panel-left-copy">
            <h1>Learn at your<br />own <em>pace.</em></h1>
            <p>
              A secure platform for trainers to share knowledge
              and students to grow — every session, every lesson,
              every milestone.
            </p>
            <div className="dots-row">
              <div className="dot active" />
              <div className="dot" />
              <div className="dot" />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="panel-right">
          <div className="form-card">
            <div className="form-header">
              <h2>Welcome back</h2>
              <p>Sign in to continue to your dashboard</p>
            </div>

            <form onSubmit={submit} noValidate>
              <div className="field">
                <label>Username</label>
                <div className="input-wrap">
                  <input
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    value={form.username}
                    onChange={handle}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label>Password</label>
                <div className="input-wrap">
                  <input
                    name="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handle}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-pass"
                    onClick={() => setShowPass((s) => !s)}
                    aria-label="Toggle password"
                  >
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="error-box">
                  <span>⚠️</span> {error}
                </div>
              )}

              <button type="submit" className="btn-login" disabled={loading}>
                {loading && <span className="spinner" />}
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <div className="divider">roles</div>
            <div className="roles-hint">
              {[
                { icon: "🛡️", label: "Admin" },
                { icon: "🧑‍🏫", label: "Trainer" },
                { icon: "🎓", label: "Student" },
              ].map(({ icon, label }) => (
                <div className="role-pill" key={label}>
                  <span className="icon">{icon}</span>
                  <span className="label">{label}</span>
                </div>
              ))}
            </div>

          {/* Signup link — properly inside the card */}
          <div style={{
            textAlign: "center", marginTop: "1.25rem",
            fontSize: ".8125rem", color: "var(--text-faint)",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#818cf8", textDecoration: "none" }}>
              Sign up
            </Link>
          </div>
          </div>
        </div>
      </div>
    </>
  );
}