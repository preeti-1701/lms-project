import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { AppContext } from "../context/AppContext";

export default function AdminDashboard() {
  const ctx = useContext(AppContext);
  const user = ctx.auth.user;

  const [pendingCourses, setPendingCourses] = useState([]);
  const [pendingTrainers, setPendingTrainers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersTab, setUsersTab] = useState("trainer");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");

  const isAdmin = user?.role === "admin";

  async function load() {
    setMessage("");
    const [courses, trainers, allEnrollments, allUsers] = await Promise.all([
      ctx.api.admin.pendingCourses(),
      ctx.api.admin.pendingTrainers(),
      ctx.api.admin.enrollments(),
      ctx.api.admin.usersByRole(usersTab),
    ]);
    setPendingCourses(courses);
    setPendingTrainers(trainers);
    setEnrollments(allEnrollments);
    setUsers(allUsers);

    // Reset selection if the currently selected user isn't in the new tab.
    if (selectedUserId && !allUsers.some((u) => u.id === selectedUserId)) {
      setSelectedUserId(null);
      setSelectedUser(null);
    }
  }

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      try {
        await load();
      } catch (e) {
        if (!cancelled) setMessage(e?.message || "Failed to load");
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, usersTab]);

  useEffect(() => {
    if (!selectedUserId) return;
    let cancelled = false;

    (async () => {
      try {
        const detail = await ctx.api.admin.userDetail(selectedUserId);
        if (!cancelled) setSelectedUser(detail);
      } catch (e) {
        if (!cancelled) setMessage(e?.message || "Failed to load user detail");
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId]);

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

  async function promoteAdmin(userId) {
    const ok = window.confirm("Make this trainer an admin?");
    if (!ok) return;
    setMessage("");
    await ctx.api.admin.promoteAdmin(userId);
    await load();
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
            <p className="mt-2 text-gray-600">
              Please{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                login
              </Link>
              .
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="mt-2 text-gray-600">This dashboard is for admins only.</p>
            <p className="mt-2 text-gray-600">
              Your role: <span className="font-semibold">{user.role}</span>
            </p>
            <div className="mt-6">
              <Link to="/" className="btn btn-primary">
                Go to Home
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <header className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-secondary">Admin Dashboard</h1>
              <p className="mt-1 text-gray-600">Manage courses, trainers, and users.</p>
            </div>
            <button className="btn btn-outline" onClick={() => ctx.actions.logout()}>
              Logout
            </button>
          </header>

          {message ? (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{message}</div>
          ) : null}

          <section className="mt-10">
            <h2 className="text-xl font-bold text-secondary">Pending Courses</h2>
            <div className="mt-4 grid gap-4">
              {pendingCourses.map((c) => (
                <div key={c.id} className="card p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-semibold text-secondary">{c.title}</div>
                      <div className="mt-1 text-gray-600">{c.description}</div>
                      <div className="mt-1 text-gray-600">Total hours: {c.total_hours}</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn btn-primary" onClick={() => approve(c.id)}>
                        Approve
                      </button>
                      <button className="btn btn-outline" onClick={() => reject(c.id)}>
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {pendingCourses.length === 0 ? <div className="card p-5 text-gray-600">No pending courses.</div> : null}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-bold text-secondary">Pending Trainers</h2>
            <div className="mt-4 grid gap-4">
              {pendingTrainers.map((t) => (
                <div key={t.user_id} className="card p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-semibold text-secondary">{t.username || t.email || `User ${t.user_id}`}</div>
                      <div className="mt-1 text-gray-600">Email: {t.email || "-"}</div>
                    </div>
                    <button className="btn btn-primary" onClick={() => approveTrainer(t.user_id)}>
                      Approve Trainer
                    </button>
                  </div>
                </div>
              ))}
              {pendingTrainers.length === 0 ? <div className="card p-5 text-gray-600">No pending trainers.</div> : null}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-bold text-secondary">All Enrollments</h2>
            <div className="mt-4 grid gap-4">
              {enrollments.map((e) => (
                <div key={e.id} className="card p-5">
                  <div className="font-semibold text-secondary">{e.course?.title || `Course ${e.course?.id}`}</div>
                  <div className="mt-1 text-gray-600">
                    Student: {e.student?.username || e.student?.email || `User ${e.student?.id}`}
                  </div>
                  <div className="mt-1 text-gray-600">
                    Enrolled: {e.enrolled_at ? new Date(e.enrolled_at).toLocaleString() : "-"}
                  </div>
                </div>
              ))}
              {enrollments.length === 0 ? <div className="card p-5 text-gray-600">No enrollments yet.</div> : null}
            </div>
          </section>

          <section className="mt-10">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-secondary">Users</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={usersTab === "trainer" ? "btn btn-primary" : "btn btn-outline"}
                  onClick={() => {
                    setUsersTab("trainer");
                  }}>
                  Trainers
                </button>
                <button
                  type="button"
                  className={usersTab === "student" ? "btn btn-primary" : "btn btn-outline"}
                  onClick={() => {
                    setUsersTab("student");
                  }}>
                  Students
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="grid gap-3">
                {users.map((u) => {
                  const isSelected = selectedUserId === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      className={
                        isSelected ? "card p-4 text-left border-gray-900" : "card p-4 text-left hover:border-gray-400"
                      }
                      onClick={() => {
                        setSelectedUserId(u.id);
                      }}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold text-secondary">
                            {u.name || u.username || u.email || `User ${u.id}`}
                          </div>
                          <div className="mt-1 text-sm text-gray-600">Email: {u.email || "-"}</div>
                        </div>
                        <span className="badge badge-primary">{u.role}</span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        Approved: {String(!!u.approved)} | Active: {String(!!u.is_active)}
                      </div>
                    </button>
                  );
                })}
                {users.length === 0 ? <div className="card p-5 text-gray-600">No users found.</div> : null}
              </div>

              <div className="card p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-bold text-secondary">User Details</div>
                    <div className="mt-1 text-sm text-gray-600">Click a user to view details.</div>
                  </div>
                  {selectedUser && selectedUser.role === "trainer" ? (
                    <button className="btn btn-outline" onClick={() => promoteAdmin(selectedUser.id)}>
                      Make Admin
                    </button>
                  ) : null}
                </div>

                {selectedUser ? (
                  <div className="mt-4 grid gap-2 text-sm">
                    <div>
                      <span className="font-medium text-secondary">Name:</span> {selectedUser.name || "-"}
                    </div>
                    <div>
                      <span className="font-medium text-secondary">Email:</span> {selectedUser.email || "-"}
                    </div>
                    <div>
                      <span className="font-medium text-secondary">Role:</span> {selectedUser.role}
                    </div>
                    <div>
                      <span className="font-medium text-secondary">Approved:</span> {String(!!selectedUser.approved)}
                    </div>
                    <div>
                      <span className="font-medium text-secondary">Active:</span> {String(!!selectedUser.is_active)}
                    </div>
                    <div>
                      <span className="font-medium text-secondary">Last login:</span>{" "}
                      {selectedUser.last_login_at ? new Date(selectedUser.last_login_at).toLocaleString() : "-"}
                    </div>
                    <div>
                      <span className="font-medium text-secondary">IP:</span> {selectedUser.ip || "-"}
                    </div>
                    <div>
                      <span className="font-medium text-secondary">Device:</span> {selectedUser.device_name || "-"}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-gray-600">No user selected.</div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
