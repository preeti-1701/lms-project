import { useContext, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import { Trash2, X } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { AppContext } from "../context/AppContext";
import { formatHoursMinutes } from "../utils/duration";

function AccessMessage({ title, message, to = "/" }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="mt-2 text-gray-600">{message}</p>
          <Link to={to} className="btn btn-primary mt-6">
            Go Back
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function tabClass({ isActive }) {
  return isActive ? "btn btn-primary" : "btn btn-outline";
}

export default function AdminDashboard() {
  const ctx = useContext(AppContext);
  const user = ctx.auth.user;

  if (!user) return <AccessMessage title="Admin Dashboard" message="Please login." to="/login" />;
  if (user.role !== "admin") return <AccessMessage title="Access Denied" message={`This dashboard is for admins only. Your role: ${user.role}`} />;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-secondary">Admin Dashboard</h1>
              <p className="mt-1 text-gray-600">Manage courses, trainers, and users.</p>
            </div>
            <button className="btn btn-outline" onClick={() => ctx.actions.logout()}>
              Logout
            </button>
          </header>

          <nav className="mt-8 flex flex-wrap gap-2">
            <NavLink to="/adminDashboard/pending-courses" className={tabClass}>
              Pending Courses
            </NavLink>
            <NavLink to="/adminDashboard/pending-trainers" className={tabClass}>
              Pending Trainers
            </NavLink>
            <NavLink to="/adminDashboard/enrollments" className={tabClass}>
              Enrollments
            </NavLink>
            <NavLink to="/adminDashboard/users/trainer" className={tabClass}>
              Trainers
            </NavLink>
            <NavLink to="/adminDashboard/users/student" className={tabClass}>
              Students
            </NavLink>
          </nav>

          <div className="mt-8">
            <Outlet />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function AdminPendingCoursesPage() {
  const ctx = useContext(AppContext);
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState("");

  async function load() {
    setMessage("");
    setCourses(await ctx.api.admin.pendingCourses());
  }

  useEffect(() => {
    load().catch((e) => setMessage(e?.message || "Failed to load pending courses"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function approve(courseId) {
    await ctx.api.admin.approveCourse(courseId);
    await load();
  }

  async function reject(courseId) {
    const reason = window.prompt("Reject reason (optional):") || "";
    await ctx.api.admin.rejectCourse(courseId, reason);
    await load();
  }

  return (
    <section>
      <h2 className="text-xl font-bold text-secondary">Pending Courses</h2>
      {message ? <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{message}</div> : null}
      <div className="mt-4 grid gap-4">
        {courses.map((course) => (
          <div key={course.id} className="card p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link to={`/adminDashboard/pending-courses/${course.id}`} className="block flex-1">
                <div className="font-semibold text-secondary hover:text-primary">{course.title}</div>
                <div className="mt-1 text-gray-600">{course.description}</div>
                <div className="mt-1 text-gray-600">Duration: {formatHoursMinutes(course.total_hours)}</div>
                <div className="mt-1 text-gray-600">
                  Trainer: {course.trainer_name || course.trainer_email || `User ${course.trainer_id}`}
                </div>
              </Link>
              <div className="flex gap-2">
                <button className="btn btn-primary" onClick={() => approve(course.id)}>
                  Approve
                </button>
                <button className="btn btn-outline" onClick={() => reject(course.id)}>
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
        {courses.length === 0 ? <div className="card p-5 text-gray-600">No pending courses.</div> : null}
      </div>
      <Outlet />
    </section>
  );
}

export function AdminPendingCourseDetailPage() {
  const ctx = useContext(AppContext);
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    ctx.api.courses
      .get(courseId)
      .then(setCourse)
      .catch((e) => setMessage(e?.message || "Failed to load course details"));
  }, [ctx.api.courses, courseId]);

  async function approve() {
    await ctx.api.admin.approveCourse(courseId);
    navigate("/adminDashboard/pending-courses");
  }

  async function reject() {
    const reason = window.prompt("Reject reason (optional):") || "";
    await ctx.api.admin.rejectCourse(courseId, reason);
    navigate("/adminDashboard/pending-courses");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 px-4 py-6">
      <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5">
          <div>
            <div className="text-lg font-bold text-secondary">Course Details</div>
            <div className="mt-1 text-sm text-gray-600">
              {course ? course.trainer_name || course.trainer_email || `Trainer ${course.trainer_id}` : message || "Loading course..."}
            </div>
          </div>
          <button type="button" className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900" onClick={() => navigate("/adminDashboard/pending-courses")}>
            X
          </button>
        </div>

        {course ? (
          <div className="max-h-[75vh] overflow-y-auto p-5">
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="text-xl font-bold text-secondary">{course.title}</h3>
              <p className="mt-2 text-gray-600">{course.description || "-"}</p>
              <div className="mt-4 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                <div>
                  <span className="font-medium text-secondary">Trainer:</span>{" "}
                  {course.trainer_name || course.trainer_email || `User ${course.trainer_id}`}
                </div>
                <div>
                  <span className="font-medium text-secondary">Trainer email:</span> {course.trainer_email || "-"}
                </div>
                <div>
                  <span className="font-medium text-secondary">Duration:</span> {formatHoursMinutes(course.total_hours)}
                </div>
                <div>
                  <span className="font-medium text-secondary">Status:</span> {course.status || "-"}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <h4 className="font-bold text-secondary">Lessons</h4>
              {course.items?.length ? (
                <div className="mt-3 grid gap-3">
                  {course.items.map((item, index) => (
                    <div key={item.id} className="rounded-lg border border-gray-200 p-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-secondary">
                            {index + 1}. {item.title}
                          </p>
                          <p className="mt-1 text-sm text-gray-600">{item.description || "-"}</p>
                        </div>
                        <span className="badge badge-primary text-xs">{formatHoursMinutes(item.hours)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-gray-500">No lessons added.</p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button className="btn btn-primary" onClick={approve}>
                Approve
              </button>
              <button className="btn btn-outline" onClick={reject}>
                Reject
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 text-sm text-gray-600">{message || "Loading..."}</div>
        )}
      </div>
    </div>
  );
}

export function AdminPendingTrainersPage() {
  const ctx = useContext(AppContext);
  const [trainers, setTrainers] = useState([]);
  const [message, setMessage] = useState("");

  async function load() {
    setMessage("");
    setTrainers(await ctx.api.admin.pendingTrainers());
  }

  useEffect(() => {
    load().catch((e) => setMessage(e?.message || "Failed to load pending trainers"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function approveTrainer(userId) {
    await ctx.api.admin.approveTrainer(userId);
    await load();
  }

  return (
    <section>
      <h2 className="text-xl font-bold text-secondary">Pending Trainers</h2>
      {message ? <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{message}</div> : null}
      <div className="mt-4 grid gap-4">
        {trainers.map((trainer) => (
          <div key={trainer.user_id} className="card p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-semibold text-secondary">{trainer.username || trainer.email || `User ${trainer.user_id}`}</div>
                <div className="mt-1 text-gray-600">Email: {trainer.email || "-"}</div>
              </div>
              <button className="btn btn-primary" onClick={() => approveTrainer(trainer.user_id)}>
                Approve Trainer
              </button>
            </div>
          </div>
        ))}
        {trainers.length === 0 ? <div className="card p-5 text-gray-600">No pending trainers.</div> : null}
      </div>
    </section>
  );
}

export function AdminEnrollmentsPage() {
  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-secondary">Enrollments</h2>
          <p className="mt-1 text-gray-600">View student applications by course or by student.</p>
        </div>
        <div className="flex gap-2">
          <NavLink to="/adminDashboard/enrollments/courses" className={tabClass}>
            By Course
          </NavLink>
          <NavLink to="/adminDashboard/enrollments/students" className={tabClass}>
            By Student
          </NavLink>
        </div>
      </div>
      <div className="mt-6">
        <Outlet />
      </div>
    </section>
  );
}

function useAdminEnrollments() {
  const ctx = useContext(AppContext);
  const [enrollments, setEnrollments] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    ctx.api.admin
      .enrollments()
      .then(setEnrollments)
      .catch((e) => setMessage(e?.message || "Failed to load enrollments"));
  }, [ctx.api.admin]);

  return { enrollments, message };
}

function groupBy(items, keyGetter) {
  return items.reduce((groups, item) => {
    const key = keyGetter(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
    return groups;
  }, new Map());
}

export function AdminEnrollmentsByCoursePage() {
  const { enrollments, message } = useAdminEnrollments();
  const grouped = Array.from(groupBy(enrollments, (enrollment) => enrollment.course?.id || "unknown").entries());

  if (message) return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{message}</div>;

  return (
    <div className="grid gap-4">
      {grouped.map(([courseId, courseEnrollments]) => {
        const course = courseEnrollments[0]?.course;
        return (
          <div key={courseId} className="card p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-bold text-secondary">{course?.title || `Course ${courseId}`}</h3>
                <p className="mt-1 text-sm text-gray-600">{course?.description || "-"}</p>
                <p className="mt-2 text-sm text-gray-500">Applied students: {courseEnrollments.length}</p>
              </div>
              <span className="badge badge-primary text-xs">{formatHoursMinutes(course?.total_hours)}</span>
            </div>

            <div className="mt-4 grid gap-3">
              {courseEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="rounded-lg border border-gray-200 p-3">
                  <p className="text-sm font-medium text-secondary">
                    {enrollment.student?.username || enrollment.student?.email || `User ${enrollment.student?.id}`}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{enrollment.student?.email || "-"}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Applied: {enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleString() : "-"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {grouped.length === 0 ? <div className="card p-5 text-gray-600">No enrollments yet.</div> : null}
    </div>
  );
}

export function AdminEnrollmentsByStudentPage() {
  const { enrollments, message } = useAdminEnrollments();
  const grouped = Array.from(groupBy(enrollments, (enrollment) => enrollment.student?.id || "unknown").entries());

  if (message) return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{message}</div>;

  return (
    <div className="grid gap-4">
      {grouped.map(([studentId, studentEnrollments]) => {
        const student = studentEnrollments[0]?.student;
        return (
          <div key={studentId} className="card p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-bold text-secondary">
                  {student?.username || student?.email || `User ${studentId}`}
                </h3>
                <p className="mt-1 text-sm text-gray-600">Email: {student?.email || "-"}</p>
              </div>
              <span className="badge badge-primary text-xs">{studentEnrollments.length} courses</span>
            </div>

            <div className="mt-4 grid gap-3">
              {studentEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="rounded-lg border border-gray-200 p-3">
                  <p className="text-sm font-medium text-secondary">
                    {enrollment.course?.title || `Course ${enrollment.course?.id}`}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Duration: {formatHoursMinutes(enrollment.course?.total_hours)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Applied: {enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleString() : "-"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {grouped.length === 0 ? <div className="card p-5 text-gray-600">No enrollments yet.</div> : null}
    </div>
  );
}

export function AdminUsersPage() {
  const ctx = useContext(AppContext);
  const { role = "trainer" } = useParams();
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  async function load() {
    setMessage("");
    setUsers(await ctx.api.admin.usersByRole(role));
  }

  useEffect(() => {
    load().catch((e) => setMessage(e?.message || "Failed to load users"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  async function deleteUser(userToDelete) {
    const label = userToDelete.name || userToDelete.username || userToDelete.email || `User ${userToDelete.id}`;
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;
    await ctx.api.admin.deleteUser(userToDelete.id);
    await load();
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold capitalize text-secondary">{role}s</h2>
      </div>
      {message ? <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{message}</div> : null}
      <div className="mt-4 grid gap-3">
        {users.map((user) => (
          <div key={user.id} className="card p-4 hover:border-gray-400">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-secondary">{user.name || user.username || user.email || `User ${user.id}`}</div>
                <div className="mt-1 text-sm text-gray-600">Email: {user.email || "-"}</div>
              </div>
              <span className="badge badge-primary">{user.role}</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Approved: {String(!!user.approved)} | Active: {String(!!user.is_active)}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link className="btn btn-outline" to={`/adminDashboard/users/${role}/${user.id}`}>
                View Details
              </Link>
              <button className="btn btn-outline flex items-center gap-2 border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50" onClick={() => deleteUser(user)}>
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
        {users.length === 0 ? <div className="card p-5 text-gray-600">No users found.</div> : null}
      </div>
      <Outlet context={{ reloadUsers: load }} />
    </section>
  );
}

export function AdminUserDetailModal() {
  const ctx = useContext(AppContext);
  const navigate = useNavigate();
  const { role, userId } = useParams();
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    ctx.api.admin
      .userDetail(userId)
      .then(setSelectedUser)
      .catch((e) => setMessage(e?.message || "Failed to load user detail"));
  }, [ctx.api.admin, userId]);

  async function promoteAdmin(userIdToPromote) {
    if (!window.confirm("Make this trainer an admin?")) return;
    await ctx.api.admin.promoteAdmin(userIdToPromote);
    navigate(`/adminDashboard/users/${role}`);
  }

  async function deleteUser(userToDelete) {
    const label = userToDelete.name || userToDelete.username || userToDelete.email || `User ${userToDelete.id}`;
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;
    await ctx.api.admin.deleteUser(userToDelete.id);
    navigate(`/adminDashboard/users/${role}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 px-4 py-6">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5">
          <div>
            <div className="text-lg font-bold text-secondary">User Details</div>
            <div className="mt-1 text-sm text-gray-600">
              {selectedUser ? selectedUser.email || selectedUser.username : message || "Loading user details..."}
            </div>
          </div>
          <button type="button" className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900" aria-label="Close user details" onClick={() => navigate(`/adminDashboard/users/${role}`)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {selectedUser ? (
          <div className="p-5">
            <div className="grid gap-2 text-sm">
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

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              {selectedUser.role === "trainer" ? (
                <button className="btn btn-outline" onClick={() => promoteAdmin(selectedUser.id)}>
                  Make Admin
                </button>
              ) : null}
              <button className="btn btn-outline flex items-center gap-2 border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50" onClick={() => deleteUser(selectedUser)}>
                <Trash2 className="h-4 w-4" />
                Delete User
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 text-sm text-gray-600">{message || "Loading..."}</div>
        )}
      </div>
    </div>
  );
}
