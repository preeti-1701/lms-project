import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "", email: "", password: "", confirm_password: "", role: "student",
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // clear field error on change
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim())           e.username         = "Username is required.";
    else if (form.username.length < 3)   e.username         = "Min 3 characters.";
    if (!form.email.includes("@"))       e.email            = "Enter a valid email.";
    if (form.password.length < 6)        e.password         = "Min 6 characters.";
    if (form.password !== form.confirm_password)
                                         e.confirm_password = "Passwords do not match.";
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});
    try {
      await api.post("/auth/register/", form);
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 2500);
    } catch (err) {
      const d = err.response?.data || {};
      // Map backend field errors + non_field_errors
      const mapped = {};
      Object.entries(d).forEach(([k, v]) => {
        mapped[k] = Array.isArray(v) ? v[0] : String(v);
      });
      setErrors(mapped);
    } finally {
      setLoading(false);
    }
  };

  const ROLES = [
    { value: "student", label: "🎓 Student",    desc: "View assigned courses"    },
    { value: "trainer", label: "🧑‍🏫 Trainer",  desc: "Create & manage courses"  },
    { value: "admin",   label: "🛡️ Admin",      desc: "Full platform access"     },
  ];

  if (success) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#0c0c0e", fontFamily: "'DM Sans', sans-serif", padding: "1.5rem",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "rgba(99,102,241,.12)", border: "1px solid rgba(99,102,241,.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem", margin: "0 auto 1.25rem",
          }}>✓</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#f1f0ee", marginBottom: ".5rem" }}>
            Account created!
          </div>
          <div style={{ color: "#555", fontSize: ".875rem", fontWeight: 300, marginBottom: "1.75rem" }}>
            Redirecting you to login…
          </div>
          <Link to="/login" style={{ color: "#818cf8", fontSize: ".875rem", textDecoration: "none" }}>
            Go to Login →
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rg-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: var(--bg-root);
          font-family: 'DM Sans', sans-serif;
        }

        /* ── LEFT PANEL ── */
        .rg-left {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 3.5rem;
          overflow: hidden;
          background: var(--bg-sidebar);
        }
        .rg-left::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 70% 55% at 75% 25%, rgba(45,212,191,.14) 0%, transparent 65%),
            radial-gradient(ellipse 50% 40% at 20% 75%, rgba(99,102,241,.12) 0%, transparent 60%);
          pointer-events: none;
        }
        .rg-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .rg-brand {
          position: absolute; top: 3.5rem; left: 3.5rem;
          display: flex; align-items: center; gap: .75rem;
        }
        .rg-brand-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #a78bfa);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }
        .rg-brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem; color: var(--text-primary); letter-spacing: -.01em;
        }
        .rg-copy { position: relative; z-index: 1; }
        .rg-copy h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.8rem, 3vw, 2.75rem);
          color: var(--text-primary); line-height: 1.15;
          letter-spacing: -.02em; margin-bottom: 1.1rem;
        }
        .rg-copy h1 em { font-style: italic; color: #2dd4bf; }
        .rg-copy p {
          font-size: .9375rem; color: "#888"; line-height: 1.7;
          max-width: 340px; font-weight: 300; color: var(--text-muted);
        }
        .rg-steps { margin-top: 2rem; display: flex; flex-direction: column; gap: .65rem; }
        .rg-step {
          display: flex; align-items: center; gap: .75rem;
          font-size: .8125rem; color: var(--text-faint); font-weight: 300;
        }
        .rg-step-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #2dd4bf; flex-shrink: 0;
          box-shadow: 0 0 6px rgba(45,212,191,.5);
        }

        /* ── RIGHT PANEL ── */
        .rg-right {
          display: flex; align-items: center; justify-content: center;
          padding: 2.5rem 2rem; background: var(--bg-root);
          overflow-y: auto;
        }
        .rg-card { width: 100%; max-width: 420px; }
        .rg-header { margin-bottom: 2rem; }
        .rg-header h2 {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem; color: var(--text-primary);
          letter-spacing: -.02em; margin-bottom: .4rem;
        }
        .rg-header p { font-size: .875rem; color: var(--text-dim); font-weight: 300; }

        /* ── Role selector ── */
        .rg-roles { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; margin-bottom: 1.25rem; }
        .rg-role {
          display: flex; flex-direction: column; gap: .25rem;
          padding: .75rem .9rem;
          background: var(--bg-input); border: 1px solid var(--border-strong); border-radius: 10px;
          cursor: pointer; transition: border-color .15s, background .15s;
          text-align: left;
        }
        .rg-role:hover { border-color: var(--border-strong); background: var(--bg-hover); }
        .rg-role.selected { border-color: #6366f1; background: rgba(99,102,241,.08); }
        .rg-role-label { font-size: .8125rem; font-weight: 500; color: var(--text-body); }
        .rg-role-desc  { font-size: .7rem; color: var(--text-faint); font-weight: 300; }

        /* ── Field ── */
        .rg-field { margin-bottom: 1rem; }
        .rg-field label {
          display: block; font-size: .7rem; font-weight: 500;
          letter-spacing: .08em; text-transform: uppercase;
          color: var(--text-label); margin-bottom: .4rem;
        }
        .rg-field label span { color: #f87171; margin-left: .2rem; }
        .rg-input-wrap { position: relative; }
        .rg-input {
          width: 100%; padding: .8rem 1rem;
          background: var(--bg-input); border-radius: 9px;
          color: var(--text-primary); font-family: 'DM Sans', sans-serif;
          font-size: .9rem; font-weight: 300; outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .rg-input::placeholder { color: var(--text-ghost); }
        .rg-input:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,.12);
        }
        .rg-input.error-field { border-color: rgba(239,68,68,.45) !important; }
        .rg-err { font-size: .72rem; color: #f87171; margin-top: .35rem; }
        .rg-eye {
          position: absolute; right: .9rem; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: var(--text-dim); font-size: .9rem; padding: 0; transition: color .15s;
        }
        .rg-eye:hover { color: #aaa; }

        /* ── Row ── */
        .rg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0 .75rem; }

        /* ── Submit ── */
        .rg-btn {
          width: 100%; padding: .9rem;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          border: none; border-radius: 9px;
          color: #fff; font-family: 'DM Sans', sans-serif;
          font-size: .9375rem; font-weight: 500;
          cursor: pointer; margin-top: .25rem;
          transition: opacity .2s, transform .15s;
        }
        .rg-btn:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
        .rg-btn:disabled { opacity: .5; cursor: not-allowed; }
        .rg-btn .spinner {
          display: inline-block; width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
          border-radius: 50%; animation: spin .6s linear infinite;
          vertical-align: middle; margin-right: .5rem;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .rg-login-link {
          text-align: center; margin-top: 1.4rem;
          font-size: .8125rem; color: var(--text-faint);
        }
        .rg-login-link a { color: #818cf8; text-decoration: none; }
        .rg-login-link a:hover { text-decoration: underline; }

        .rg-global-err {
          display: flex; align-items: center; gap: .6rem;
          background: rgba(239,68,68,.08);
          border: 1px solid rgba(239,68,68,.25);
          border-radius: 8px; padding: .75rem 1rem;
          font-size: .85rem; color: #f87171; margin-bottom: 1.1rem;
        }

        @media (max-width: 768px) {
          .rg-root { grid-template-columns: 1fr; }
          .rg-left { display: none; }
        }
      `}</style>

      <div className="rg-root">
        {/* LEFT */}
        <div className="rg-left">
          <div className="rg-grid" />
          <div className="rg-brand">
            <div className="rg-brand-icon">📚</div>
            <span className="rg-brand-name">LearnHub</span>
          </div>
          <div className="rg-copy">
            <h1>Start your<br /><em>journey</em> today.</h1>
            <p>
              Join hundreds of learners and trainers on a platform
              built for focused, secure, and structured learning.
            </p>
            <div className="rg-steps">
              {[
                "Create your account in seconds",
                "Get assigned to courses by your trainer",
                "Watch videos securely from any device",
              ].map((s) => (
                <div className="rg-step" key={s}>
                  <div className="rg-step-dot" />
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="rg-right">
          <div className="rg-card">
            <div className="rg-header">
              <h2>Create account</h2>
              <p>Fill in your details to get started</p>
            </div>

            {/* Role selector */}
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ fontSize: ".7rem", fontWeight: 500, letterSpacing: ".08em", textTransform: "uppercase", color: "#666", marginBottom: ".6rem" }}>
                I am a
              </div>
              <div className="rg-roles">
                {ROLES.map(({ value, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    className={`rg-role ${form.role === value ? "selected" : ""}`}
                    onClick={() => setForm({ ...form, role: value })}
                  >
                    <span className="rg-role-label">{label}</span>
                    <span className="rg-role-desc">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={submit} noValidate>
              {/* Username + Email */}
              <div className="rg-row">
                <div className="rg-field">
                  <label>Username <span>*</span></label>
                  <div className="rg-input-wrap">
                    <input
                      name="username" value={form.username} onChange={handle}
                      placeholder="johndoe" autoComplete="username"
                      className={`rg-input ${errors.username ? "error-field" : ""}`}
                      style={{ border: `1px solid ${errors.username ? "rgba(239,68,68,.45)" : "#2a2a2e"}` }}
                    />
                  </div>
                  {errors.username && <div className="rg-err">{errors.username}</div>}
                </div>

                <div className="rg-field">
                  <label>Email <span>*</span></label>
                  <div className="rg-input-wrap">
                    <input
                      name="email" type="email" value={form.email} onChange={handle}
                      placeholder="john@example.com" autoComplete="email"
                      className={`rg-input ${errors.email ? "error-field" : ""}`}
                      style={{ border: `1px solid ${errors.email ? "rgba(239,68,68,.45)" : "#2a2a2e"}` }}
                    />
                  </div>
                  {errors.email && <div className="rg-err">{errors.email}</div>}
                </div>
              </div>

              {/* Password + Confirm */}
              <div className="rg-row">
                <div className="rg-field">
                  <label>Password <span>*</span></label>
                  <div className="rg-input-wrap">
                    <input
                      name="password" type={showPass ? "text" : "password"}
                      value={form.password} onChange={handle}
                      placeholder="••••••" autoComplete="new-password"
                      className={`rg-input ${errors.password ? "error-field" : ""}`}
                      style={{ border: `1px solid ${errors.password ? "rgba(239,68,68,.45)" : "#2a2a2e"}`, paddingRight: "2.5rem" }}
                    />
                    <button type="button" className="rg-eye" onClick={() => setShowPass((s) => !s)}>
                      {showPass ? "🙈" : "👁"}
                    </button>
                  </div>
                  {errors.password && <div className="rg-err">{errors.password}</div>}
                </div>

                <div className="rg-field">
                  <label>Confirm <span>*</span></label>
                  <div className="rg-input-wrap">
                    <input
                      name="confirm_password" type={showConfirm ? "text" : "password"}
                      value={form.confirm_password} onChange={handle}
                      placeholder="••••••" autoComplete="new-password"
                      className={`rg-input ${errors.confirm_password ? "error-field" : ""}`}
                      style={{ border: `1px solid ${errors.confirm_password ? "rgba(239,68,68,.45)" : "#2a2a2e"}`, paddingRight: "2.5rem" }}
                    />
                    <button type="button" className="rg-eye" onClick={() => setShowConfirm((s) => !s)}>
                      {showConfirm ? "🙈" : "👁"}
                    </button>
                  </div>
                  {errors.confirm_password && <div className="rg-err">{errors.confirm_password}</div>}
                </div>
              </div>

              {/* Global / non-field error */}
              {(errors.non_field_errors || errors.detail) && (
                <div className="rg-global-err">
                  <span>⚠️</span> {errors.non_field_errors || errors.detail}
                </div>
              )}

              <button type="submit" className="rg-btn" disabled={loading}>
                {loading && <span className="spinner" />}
                {loading ? "Creating account…" : "Create Account"}
              </button>
            </form>

            <div className="rg-login-link">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}