import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AppContext } from "../context/AppContext";

export default function LandingPage() {
  const navigate = useNavigate();
  const ctx = useContext(AppContext);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [signupRole, setSignupRole] = useState("student");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupMobile, setSignupMobile] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupResult, setSignupResult] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    const data = await ctx.actions.login({ identifier, password });
    const role = data?.user?.role;
    const approved = !!data?.user?.approved;

    if (role === "admin") navigate("/adminDashboard");
    else if (role === "trainer") navigate("/trainerDashboard", { state: { approved } });
    else navigate("/sudentDashboard");
  }

  async function handleSignup(e) {
    e.preventDefault();
    const data = await ctx.actions.signup({
      role: signupRole,
      email: signupEmail,
      mobile: signupMobile,
      username: "",
      password: signupPassword,
    });
    setSignupResult(data);
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h1>Learning Management System</h1>
      <p>Upload trainer courses (YouTube links) and let students enroll and watch.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
        <section style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
          <h2>Login</h2>
          <form onSubmit={handleLogin} style={{ display: "grid", gap: 8 }}>
            <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Email or mobile" />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
            />
            <button type="submit" disabled={ctx.loading}>
              Login
            </button>
            {ctx.error ? <div style={{ color: "crimson" }}>{ctx.error}</div> : null}
          </form>
          <p style={{ marginTop: 12 }}>After login you’ll be routed to your dashboard.</p>
        </section>

        <section style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
          <h2>Signup</h2>
          <form onSubmit={handleSignup} style={{ display: "grid", gap: 8 }}>
            <label>
              Role
              <select value={signupRole} onChange={(e) => setSignupRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="trainer">Trainer</option>
              </select>
            </label>
            <input
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              placeholder="Email (optional)"
            />
            <input
              value={signupMobile}
              onChange={(e) => setSignupMobile(e.target.value)}
              placeholder="Mobile (optional)"
            />
            <input
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              placeholder="Password"
              type="password"
            />
            <button type="submit" disabled={ctx.loading}>
              Create Account
            </button>
          </form>

          {signupResult ? (
            <div style={{ marginTop: 12 }}>
              <div>Created: {signupResult.email || signupResult.username}</div>
              <div>
                Role: <b>{signupResult.role}</b> — Approved: <b>{String(signupResult.approved)}</b>
              </div>
              {signupResult.role === "trainer" && !signupResult.approved ? (
                <div style={{ marginTop: 8 }}>Trainer accounts require admin approval before uploading courses.</div>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>

      <hr style={{ margin: "24px 0" }} />
      <div>
        <h3>Routes</h3>
        <ul>
          <li>
            <code>/</code> Landing page
          </li>
          <li>
            <code>/sudentDashboard</code> Student dashboard
          </li>
          <li>
            <code>/trainerDashboard</code> Trainer dashboard
          </li>
          <li>
            <code>/adminDashboard</code> Admin dashboard
          </li>
        </ul>
        <p>
          Already logged in? Go to: <Link to="/sudentDashboard">Student</Link> |{" "}
          <Link to="/trainerDashboard">Trainer</Link> | <Link to="/adminDashboard">Admin</Link>
        </p>
      </div>
    </div>
  );
}
