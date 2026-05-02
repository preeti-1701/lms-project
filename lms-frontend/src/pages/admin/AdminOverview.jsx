import { useEffect, useState } from "react";
import api from "../../api/axios";

const S = {
  root: { fontFamily: "'DM Sans', sans-serif" },
  heading: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.6rem", color: "var(--text-primary)",
    letterSpacing: "-.02em", marginBottom: ".3rem",
  },
  sub: { fontSize: ".8125rem", color: "var(--text-faint)", fontWeight: 300, marginBottom: "2rem" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: ".75rem", marginBottom: "2rem" },
  card: {
    background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px",
    padding: "1.1rem 1.25rem",
  },
  cnum: { fontSize: "1.8rem", fontWeight: 500, lineHeight: 1, marginBottom: ".3rem" },
  clbl: { fontSize: ".7rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: ".07em" },
  section: {
    background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px",
    padding: "1.25rem",
  },
  sTitle: { fontSize: ".8125rem", fontWeight: 500, color: "var(--text-muted)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: ".07em" },
  row: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: ".65rem 0", borderBottom: "1px solid #161618",
    fontSize: ".8125rem",
  },
  pill: {
    fontSize: ".65rem", fontWeight: 500, padding: ".2rem .55rem",
    borderRadius: "20px", border: "1px solid",
  },
};

const ROLE_COLOR = {
  admin:   { color: "#ecaf4f", bg: "rgba(236,175,79,.1)",  border: "rgba(236,175,79,.25)" },
  trainer: { color: "#2dd4bf", bg: "rgba(45,212,191,.1)",  border: "rgba(45,212,191,.25)" },
  student: { color: "#818cf8", bg: "rgba(129,140,248,.1)", border: "rgba(129,140,248,.25)" },
};

export default function AdminOverview() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/courses/list/")
      .then(({ data }) => setCourses(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalVideos = courses.reduce((s, c) => s + (c.videos?.length || 0), 0);

  const STATS = [
    { num: courses.length, label: "Total Courses", color: "#ecaf4f" },
    { num: totalVideos,    label: "Total Videos",  color: "#818cf8" },
    { num: "—",            label: "Enrolled",      color: "#2dd4bf", note: true },
    { num: "—",            label: "Active Users",  color: "#f472b6", note: true },
  ];

  return (
    <div style={S.root}>
      <div style={S.heading}>Overview</div>
      <div style={S.sub}>Platform snapshot — courses and content at a glance</div>

      <div style={S.grid}>
        {STATS.map(({ num, label, color, note }) => (
          <div key={label} style={S.card}>
            <div style={{ ...S.cnum, color }}>{loading && !note ? "…" : num}</div>
            <div style={S.clbl}>{label}</div>
            {note && <div style={{ fontSize: ".65rem", color: "var(--border-strong)", marginTop: ".3rem" }}>needs /users/ API</div>}
          </div>
        ))}
      </div>

      <div style={S.section}>
        <div style={S.sTitle}>Recent Courses</div>
        {loading ? (
          [1,2,3].map((i) => (
            <div key={i} style={{ height: 36, background: "var(--bg-hover)", borderRadius: 6, marginBottom: 8,
              animation: "pulse 1.4s ease infinite", opacity: .6 }} />
          ))
        ) : courses.length === 0 ? (
          <div style={{ color: "var(--text-ghost)", fontSize: ".8125rem", padding: "1rem 0" }}>No courses yet.</div>
        ) : (
          courses.slice(0, 6).map((c) => {
            const rc = ROLE_COLOR[c.role] || ROLE_COLOR.trainer;
            return (
              <div key={c.id} style={S.row}>
                <div>
                  <span style={{ color: "var(--text-body)" }}>{c.title}</span>
                  <span style={{ color: "var(--text-ghost)", fontSize: ".75rem", marginLeft: ".5rem" }}>
                    {c.videos?.length || 0} video{c.videos?.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <span style={{ ...S.pill, color: rc.color, borderColor: rc.border, background: rc.bg }}>
                  course
                </span>
              </div>
            );
          })
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.8} }`}</style>
    </div>
  );
}