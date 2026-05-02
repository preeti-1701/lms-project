import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import FormField from "../../components/shared/FormField";

function btnS(color, bg, border, full = false) {
  return {
    padding: ".65rem 1.1rem", background: bg,
    border: `1px solid ${border}`, borderRadius: "9px",
    color, fontFamily: "'DM Sans', sans-serif", fontSize: ".8125rem",
    cursor: "pointer", width: full ? "100%" : "auto",
  };
}

export default function TrainerAssign() {
  const [courses,  setCourses]  = useState([]);
  const [form,     setForm]     = useState({ student: "", course: "" });
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const fetchCourses = useCallback(async () => {
    setFetching(true);
    try {
      const { data } = await api.get("/courses/my-courses/");
      setCourses(data);
    } catch {
      setError("Could not load courses.");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.student || !form.course) { setError("Both fields are required."); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      await api.post("/enrollments/assign/", {
        student: Number(form.student),
        course: Number(form.course),
      });
      const courseName = courses.find((c) => String(c.id) === String(form.course))?.title || "Course";
      setSuccess(`Student #${form.student} has been enrolled in "${courseName}".`);
      setForm({ student: "", course: "" });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        JSON.stringify(err.response?.data) ||
        "Assignment failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 540 }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", color: "var(--text-primary)", letterSpacing: "-.02em", marginBottom: ".3rem" }}>
        Assign Courses
      </div>
      <div style={{ fontSize: ".8125rem", color: "var(--text-faint)", fontWeight: 300, marginBottom: "2rem" }}>
        Enroll a student in one of your courses
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 13, padding: "1.5rem" }}>
        {success && (
          <div style={{ display: "flex", alignItems: "center", gap: ".65rem", background: "rgba(45,212,191,.07)", border: "1px solid rgba(45,212,191,.2)", borderRadius: 9, padding: ".75rem 1rem", marginBottom: "1.25rem", fontSize: ".875rem", color: "#2dd4bf" }}>
            <span>✓</span> {success}
          </div>
        )}
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: ".65rem", background: "rgba(239,68,68,.07)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 9, padding: ".75rem 1rem", marginBottom: "1.25rem", fontSize: ".875rem", color: "#f87171" }}>
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={submit} noValidate>
          <FormField
            label="Student ID"
            name="student"
            type="number"
            value={form.student}
            onChange={handle}
            placeholder="Enter student's user ID"
            required
          />
          <div style={{ fontSize: ".7rem", color: "var(--text-faint)", marginTop: "-.6rem", marginBottom: ".9rem", lineHeight: 1.6 }}>
            💡 Will become a searchable dropdown once <code style={{ fontFamily: "monospace", fontSize: ".7rem", background: "rgba(255,255,255,.05)", padding: ".1rem .3rem", borderRadius: 3 }}>GET /api/auth/users/</code> is added.
          </div>

          <FormField
            label="Course"
            name="course"
            value={form.course}
            onChange={handle}
            options={fetching ? [] : courses.map((c) => ({ value: c.id, label: c.title }))}
            placeholder={fetching ? "Loading courses…" : "Select a course"}
            disabled={fetching}
            required
          />

          <button type="submit" disabled={loading || fetching}
            style={{ ...btnS("#2dd4bf","rgba(45,212,191,.1)","rgba(45,212,191,.3)", true), marginTop: ".25rem", opacity: (loading || fetching) ? .5 : 1 }}>
            {loading ? "Assigning…" : "Assign Course"}
          </button>
        </form>
      </div>

      {/* Course summary panel */}
      <div style={{ marginTop: "1.5rem" }}>
        <div style={{ fontSize: ".7rem", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: ".75rem" }}>
          Your Courses ({courses.length})
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
          {fetching ? (
            [1,2,3].map((i) => (
              <div key={i} style={{ height: 42, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 9, animation: "pulse 1.4s ease infinite" }} />
            ))
          ) : courses.length === 0 ? (
            <div style={{ color: "var(--text-ghost)", fontSize: ".8rem" }}>No courses found. Create one first.</div>
          ) : (
            courses.map((c) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 9, padding: ".65rem 1rem" }}>
                <div>
                  <span style={{ fontSize: ".8125rem", color: "var(--text-body)", fontWeight: 500 }}>{c.title}</span>
                  <span style={{ fontSize: ".7rem", color: "var(--text-faint)", marginLeft: ".5rem" }}>ID: {c.id}</span>
                </div>
                <span style={{ fontSize: ".7rem", color: "#2dd4bf", background: "rgba(45,212,191,.08)", border: "1px solid rgba(45,212,191,.2)", borderRadius: 20, padding: ".15rem .5rem" }}>
                  {c.videos?.length || 0} videos
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.8} }`}</style>
    </div>
  );
}