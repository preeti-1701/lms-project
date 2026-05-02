import { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import Modal from "../../components/shared/Modal";
import FormField from "../../components/shared/FormField";

const ROLES = [
  { value: "student", label: "Student" },
  { value: "trainer", label: "Trainer" },
  { value: "admin",   label: "Admin"   },
];

const ROLE_COLOR = {
  admin:   { color: "#ecaf4f", border: "rgba(236,175,79,.25)",  bg: "rgba(236,175,79,.08)"  },
  trainer: { color: "#2dd4bf", border: "rgba(45,212,191,.25)",  bg: "rgba(45,212,191,.08)"  },
  student: { color: "#818cf8", border: "rgba(129,140,248,.25)", bg: "rgba(129,140,248,.08)" },
};

function btnS(color, bg, border, full = false) {
  return {
    padding: ".65rem 1.1rem", background: bg, border: `1px solid ${border}`,
    borderRadius: "9px", color, fontFamily: "'DM Sans', sans-serif",
    fontSize: ".8125rem", cursor: "pointer", width: full ? "100%" : "auto",
  };
}

// ── Create User Modal ─────────────────────────────────────────────────
function CreateUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm_password: "", role: "student" });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.username.trim())                     e.username         = "Required";
    if (!form.email.includes("@"))                 e.email            = "Valid email required";
    if (form.password.length < 6)                  e.password         = "Min 6 characters";
    if (form.password !== form.confirm_password)   e.confirm_password = "Passwords do not match";
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setErrors({});
    try {
      const { data } = await api.post("/auth/register/", form);
      setSuccess(data);
      onCreated?.(data);
    } catch (err) {
      const d = err.response?.data || {};
      setErrors(Object.fromEntries(Object.entries(d).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])));
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div style={{ textAlign: "center", padding: "1rem 0", fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ fontSize: "2rem", marginBottom: ".75rem" }}>✓</div>
      <div style={{ color: "var(--text-body)", marginBottom: ".4rem" }}>
        User <strong style={{ color: "var(--text-primary)" }}>{success.username}</strong> created
      </div>
      <div style={{ fontSize: ".8rem", color: "var(--text-faint)", marginBottom: "1.5rem" }}>{success.email} · {success.role}</div>
      <button onClick={onClose} style={btnS("#ecaf4f","rgba(236,175,79,.1)","rgba(236,175,79,.3)")}>Done</button>
    </div>
  );

  return (
    <form onSubmit={submit} noValidate>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 .75rem" }}>
        <FormField label="Username" name="username" value={form.username} onChange={handle} placeholder="johndoe" required error={errors.username} />
        <FormField label="Email" name="email" type="email" value={form.email} onChange={handle} placeholder="john@example.com" required error={errors.email} />
      </div>
      <FormField label="Role" name="role" value={form.role} onChange={handle} options={ROLES} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 .75rem" }}>
        <FormField label="Password" name="password" type="password" value={form.password} onChange={handle} placeholder="••••••" required error={errors.password} />
        <FormField label="Confirm" name="confirm_password" type="password" value={form.confirm_password} onChange={handle} placeholder="••••••" required error={errors.confirm_password} />
      </div>
      {errors.non_field_errors && <div style={{ fontSize: ".8rem", color: "#f87171", marginBottom: ".75rem" }}>{errors.non_field_errors}</div>}
      <button type="submit" disabled={loading} style={btnS("#ecaf4f","rgba(236,175,79,.12)","rgba(236,175,79,.35)", true)}>
        {loading ? "Creating…" : "Create User"}
      </button>
    </form>
  );
}

// ── Force Logout Modal ────────────────────────────────────────────────
function ForceLogoutModal({ user, onClose }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState("");

  const confirm = async () => {
    setLoading(true);
    try {
      await api.post("/auth/force-logout/", { user_id: user.id });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to force logout.");
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div style={{ textAlign: "center", padding: ".75rem 0", fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ fontSize: "1.75rem", marginBottom: ".6rem" }}>✓</div>
      <div style={{ color: "var(--text-body)", marginBottom: "1.25rem" }}>
        <strong style={{ color: "var(--text-primary)" }}>{user.username}</strong> logged out from all devices.
      </div>
      <button onClick={onClose} style={btnS("#ecaf4f","rgba(236,175,79,.1)","rgba(236,175,79,.3)")}>Close</button>
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ fontSize: ".875rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "1.25rem" }}>
        This will immediately invalidate all active sessions for{" "}
        <strong style={{ color: "var(--text-primary)" }}>{user.username}</strong> ({user.email}).
        They will need to log in again.
      </div>
      {error && <div style={{ fontSize: ".8rem", color: "#f87171", marginBottom: ".75rem" }}>{error}</div>}
      <div style={{ display: "flex", gap: ".75rem" }}>
        <button onClick={onClose} style={btnS("var(--text-dim)","var(--bg-hover)","var(--border-strong)")}>Cancel</button>
        <button onClick={confirm} disabled={loading} style={btnS("#f87171","rgba(239,68,68,.08)","rgba(239,68,68,.3)", true)}>
          {loading ? "Logging out…" : "Force Logout"}
        </button>
      </div>
    </div>
  );
}

// ── Search + Filter bar ───────────────────────────────────────────────
function SearchBar({ value, onChange, roleFilter, onRoleFilter }) {
  return (
    <div style={{ display: "flex", gap: ".5rem", marginBottom: "1.1rem", flexWrap: "wrap" }}>
      <input
        value={value} onChange={(e) => onChange(e.target.value)}
        placeholder="Search by username or email…"
        style={{
          flex: 1, minWidth: 180, padding: ".6rem .9rem",
          background: "var(--bg-input)", border: "1px solid var(--border-strong)",
          borderRadius: "9px", color: "var(--text-primary)",
          fontFamily: "'DM Sans',sans-serif", fontSize: ".8125rem", outline: "none",
        }}
      />
      {["all", "admin", "trainer", "student"].map((r) => {
        const active = roleFilter === r;
        const rc = ROLE_COLOR[r] || { color: "var(--text-label)", border: "var(--border-strong)", bg: "transparent" };
        return (
          <button key={r} onClick={() => onRoleFilter(r)} style={{
            padding: ".5rem .85rem", borderRadius: "8px", cursor: "pointer",
            fontFamily: "'DM Sans',sans-serif", fontSize: ".72rem", fontWeight: 500,
            border: `1px solid ${active ? rc.border : "var(--border)"}`,
            background: active ? rc.bg : "transparent",
            color: active ? rc.color : "var(--text-faint)",
            textTransform: "capitalize",
          }}>
            {r === "all" ? "All" : r}
          </button>
        );
      })}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function AdminUsers() {
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [showCreate,  setShowCreate]  = useState(false);
  const [forceTarget, setForceTarget] = useState(null);
  const [search,      setSearch]      = useState("");
  const [roleFilter,  setRoleFilter]  = useState("all");

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data } = await api.get("/auth/users/");
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load users. Make sure GET /api/auth/users/ exists in your backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreated = (newUser) => {
    setUsers((prev) => [newUser, ...prev]);
    setShowCreate(false);
  };

  const filtered = users.filter((u) => {
    const matchRole   = roleFilter === "all" || u.role === roleFilter;
    const matchSearch = !search
      || u.username?.toLowerCase().includes(search.toLowerCase())
      || u.email?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const S = {
    root:    { fontFamily: "'DM Sans', sans-serif" },
    hrow:    { display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1.5rem", gap: "1rem", flexWrap: "wrap" },
    heading: { fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", color: "var(--text-primary)", letterSpacing: "-.02em", marginBottom: ".3rem" },
    sub:     { fontSize: ".8125rem", color: "var(--text-faint)", fontWeight: 300 },
    twrap:   { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" },
    th:      { textAlign: "left", fontSize: ".65rem", fontWeight: 500, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--text-faint)", padding: ".65rem 1rem", borderBottom: "1px solid #1a1a1e" },
    td:      { padding: ".75rem 1rem", borderBottom: "1px solid #161618", fontSize: ".8125rem", color: "var(--text-body)" },
    pill:    { fontSize: ".65rem", fontWeight: 500, padding: ".2rem .55rem", borderRadius: "20px", border: "1px solid", display: "inline-block" },
  };

  return (
    <div style={S.root}>
      <div style={S.hrow}>
        <div>
          <div style={S.heading}>Users</div>
          <div style={S.sub}>
            {loading ? "Loading…" : `${users.length} user${users.length !== 1 ? "s" : ""} · ${filtered.length} shown`}
          </div>
        </div>
        <div style={{ display: "flex", gap: ".5rem" }}>
          <button onClick={fetchUsers} style={btnS("var(--text-dim)", "var(--bg-card)", "var(--border)")}>↻ Refresh</button>
          <button onClick={() => setShowCreate(true)} style={btnS("#ecaf4f","rgba(236,175,79,.12)","rgba(236,175,79,.3)")}>
            + Create User
          </button>
        </div>
      </div>

      <SearchBar value={search} onChange={setSearch} roleFilter={roleFilter} onRoleFilter={setRoleFilter} />

      {/* Error state */}
      {error && (
        <div style={{ background: "rgba(239,68,68,.07)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 10, padding: ".9rem 1.1rem", marginBottom: "1.1rem" }}>
          <div style={{ color: "#f87171", fontSize: ".875rem", marginBottom: ".4rem" }}>⚠ {error}</div>
          <div style={{ fontSize: ".75rem", color: "#664444", lineHeight: 1.7 }}>
            Add this view to your Django backend:
            <br />
            <code style={{ fontFamily: "monospace", background: "rgba(255,255,255,.05)", padding: ".15rem .4rem", borderRadius: 3, fontSize: ".72rem" }}>
              GET /api/auth/users/ — IsAdmin permission only
            </code>
            <br />
            It should return: <code style={{ fontFamily: "monospace", background: "rgba(255,255,255,.05)", padding: ".1rem .3rem", borderRadius: 3, fontSize: ".72rem" }}>
              [&#123;"id","username","email","role"&#125;, ...]
            </code>
          </div>
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <div style={S.twrap}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["#", "Username", "Email", "Role", "Actions"].map((h) => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((i) => (
                <tr key={i}>
                  {[40, 120, 180, 80, 110].map((w, j) => (
                    <td key={j} style={S.td}>
                      <div style={{ height: 12, width: w, background: "var(--bg-hover)", borderRadius: 4, animation: "pulse 1.4s ease infinite" }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User table */}
      {!loading && !error && (
        <div style={S.twrap}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["#", "Username", "Email", "Role", "Actions"].map((h) => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...S.td, textAlign: "center", color: "var(--text-ghost)", padding: "2rem" }}>
                    No users found
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const rc = ROLE_COLOR[u.role] || ROLE_COLOR.student;
                  return (
                    <tr key={u.id}
                      onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover2)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      style={{ transition: "background .15s" }}
                    >
                      <td style={{ ...S.td, color: "var(--text-ghost)", width: 40 }}>{u.id}</td>
                      <td style={S.td}><strong style={{ color: "var(--text-secondary)" }}>{u.username}</strong></td>
                      <td style={{ ...S.td, color: "var(--text-label)" }}>{u.email}</td>
                      <td style={S.td}>
                        <span style={{ ...S.pill, color: rc.color, borderColor: rc.border, background: rc.bg }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={S.td}>
                        <button
                          onClick={() => setForceTarget(u)}
                          style={{ padding: ".35rem .75rem", background: "rgba(239,68,68,.07)", border: "1px solid rgba(239,68,68,.2)", borderRadius: "7px", color: "#f87171", fontFamily: "'DM Sans',sans-serif", fontSize: ".72rem", cursor: "pointer" }}
                        >
                          Force Logout
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <Modal title="Create New User" onClose={() => setShowCreate(false)}>
          <CreateUserModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
        </Modal>
      )}
      {forceTarget && (
        <Modal title="Force Logout User" onClose={() => setForceTarget(null)}>
          <ForceLogoutModal user={forceTarget} onClose={() => setForceTarget(null)} />
        </Modal>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.8} }`}</style>
    </div>
  );
}