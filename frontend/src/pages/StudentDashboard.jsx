import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { AppContext } from "../context/AppContext";

export default function StudentDashboard() {
  const ctx = useContext(AppContext);
  const user = ctx.auth.user;

  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");

  const isStudent = user?.role === "student";

  async function load() {
    setMessage("");
    const [c, e] = await Promise.all([ctx.api.courses.list(), ctx.api.courses.myEnrollments()]);
    setCourses(c);
    setEnrollments(e);
  }

  useEffect(() => {
    if (!user) return;
    load().catch((e) => setMessage(e?.message || "Failed to load"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const enrolledCourseIds = useMemo(() => new Set(enrollments.map((x) => String(x.course?.id))), [enrollments]);

  async function handleEnroll(courseId) {
    setMessage("");
    await ctx.api.courses.enroll(courseId);
    await load();
  }

  async function handleViewItems(courseId) {
    setMessage("");
    setSelectedCourseId(String(courseId));
    try {
      const data = await ctx.api.courses.items(courseId);
      setItems(data);
    } catch (e) {
      setItems([]);
      setMessage(e?.message || "Unable to load items");
    }
  }

  if (!user) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Student Dashboard</h2>
        <p>
          Please <Link to="/">login</Link>.
        </p>
      </div>
    );
  }

  if (!isStudent) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Student Dashboard</h2>
        <p>Access denied for role: {user.role}</p>
        <p>
          Go back <Link to="/">home</Link>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <h2>Student Dashboard</h2>
        <button onClick={() => ctx.actions.logout()}>Logout</button>
      </header>

      {message ? <div style={{ color: "crimson" }}>{message}</div> : null}

      <section style={{ marginTop: 16 }}>
        <h3>Available Courses</h3>
        <div style={{ display: "grid", gap: 12 }}>
          {courses.map((c) => {
            const enrolled = enrolledCourseIds.has(String(c.id));
            return (
              <div key={c.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{c.title}</div>
                    <div style={{ opacity: 0.85 }}>{c.description}</div>
                    <div style={{ opacity: 0.85 }}>Total hours: {c.total_hours}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => handleEnroll(c.id)} disabled={enrolled}>
                      {enrolled ? "Enrolled" : "Enroll"}
                    </button>
                    <button onClick={() => handleViewItems(c.id)} disabled={!enrolled}>
                      View
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ marginTop: 16 }}>
        <h3>Course Content</h3>
        {selectedCourseId ? <div>Course ID: {selectedCourseId}</div> : <div>Select a course to view</div>}
        <ol>
          {items.map((it) => (
            <li key={it.id} style={{ marginTop: 8 }}>
              <div style={{ fontWeight: 700 }}>{it.title}</div>
              <div style={{ opacity: 0.85 }}>{it.description}</div>
              <div>
                <a href={it.youtube_url} target="_blank" rel="noreferrer">
                  {it.youtube_url}
                </a>
              </div>
              <div>Hours: {it.hours}</div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
