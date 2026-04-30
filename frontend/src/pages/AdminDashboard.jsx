import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { AppContext } from "../context/AppContext";

export default function AdminDashboard() {
  const ctx = useContext(AppContext);
  const user = ctx.auth.user;

  const [pendingCourses, setPendingCourses] = useState([]);
  const [pendingTrainers, setPendingTrainers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  const isAdmin = user?.role === "admin";

  async function load() {
    setMessage("");
    const [courses, trainers, allEnrollments, allUsers] = await Promise.all([
      ctx.api.admin.pendingCourses(),
      ctx.api.admin.pendingTrainers(),
      ctx.api.admin.enrollments(),
      ctx.api.admin.users(),
    ]);
    setPendingCourses(courses);
    setPendingTrainers(trainers);
    setEnrollments(allEnrollments);
    setUsers(allUsers);
  }

  useEffect(() => {
    if (!user) return;
    load().catch((e) => setMessage(e?.message || "Failed to load"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function approve(courseId) {
    setMessage("");
    await ctx.api.admin.approveCourse(courseId);
    await load();
  }

  async function reject(courseId) {
    const reason = window.prompt("Reject reason (optional):") || "";
    setMessage("");
    await ctx.api.admin.rejectCourse(courseId, reason);
    await load();
  }

  async function approveTrainer(userId) {
    setMessage("");
    await ctx.api.admin.approveTrainer(userId);
    await load();
  }

  if (!user) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Admin Dashboard</h2>
        <p>
          Please <Link to="/">login</Link>.
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Admin Dashboard</h2>
        <p>Access denied for role: {user.role}</p>
        <p>
          Go back <Link to="/">home</Link>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <h2>Admin Dashboard</h2>
        <button onClick={() => ctx.actions.logout()}>Logout</button>
      </header>

      {message ? <div style={{ color: "crimson", marginTop: 12 }}>{message}</div> : null}

      <section style={{ marginTop: 16 }}>
        <h3>Pending Courses</h3>
        <div style={{ display: "grid", gap: 12 }}>
          {pendingCourses.map((c) => (
            <div key={c.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{c.title}</div>
                  <div style={{ opacity: 0.85 }}>{c.description}</div>
                  <div style={{ opacity: 0.85 }}>Total hours: {c.total_hours}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => approve(c.id)}>Approve</button>
                  <button onClick={() => reject(c.id)}>Reject</button>
                </div>
              </div>
            </div>
          ))}
          {pendingCourses.length === 0 ? <div>No pending courses.</div> : null}
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Pending Trainers</h3>
        <div style={{ display: "grid", gap: 12 }}>
          {pendingTrainers.map((t) => (
            <div key={t.user_id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{t.username || t.email || `User ${t.user_id}`}</div>
                  <div style={{ opacity: 0.85 }}>Email: {t.email || "-"}</div>
                  <div style={{ opacity: 0.85 }}>Mobile: {t.mobile || "-"}</div>
                </div>
                <button onClick={() => approveTrainer(t.user_id)}>Approve Trainer</button>
              </div>
            </div>
          ))}
          {pendingTrainers.length === 0 ? <div>No pending trainers.</div> : null}
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>All Enrollments</h3>
        <div style={{ display: "grid", gap: 12 }}>
          {enrollments.map((e) => (
            <div key={e.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{e.course?.title || `Course ${e.course?.id}`}</div>
                  <div style={{ opacity: 0.85 }}>
                    Student: {e.student?.username || e.student?.email || `User ${e.student?.id}`}
                  </div>
                  <div style={{ opacity: 0.85 }}>
                    Enrolled: {e.enrolled_at ? new Date(e.enrolled_at).toLocaleString() : "-"}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {enrollments.length === 0 ? <div>No enrollments yet.</div> : null}
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>All Users</h3>
        <div style={{ display: "grid", gap: 12 }}>
          {users.map((u) => (
            <div key={u.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{u.username || u.email || `User ${u.id}`}</div>
                  <div style={{ opacity: 0.85 }}>Email: {u.email || "-"}</div>
                  <div style={{ opacity: 0.85 }}>Mobile: {u.mobile || "-"}</div>
                  <div style={{ opacity: 0.85 }}>
                    Role: {u.role} | Approved: {String(!!u.approved)} | Active: {String(!!u.is_active)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {users.length === 0 ? <div>No users found.</div> : null}
        </div>
      </section>
    </div>
  );
}
