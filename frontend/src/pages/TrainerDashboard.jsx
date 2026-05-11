import { useContext, useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { AlertCircle, Pencil, Plus, Trash2 } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { AppContext } from "../context/AppContext";
import { formatHoursMinutes } from "../utils/duration";

function emptyItem() {
  return { title: "", description: "", youtube_url: "", hours: "0.00", order: 0 };
}

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

export default function TrainerDashboard() {
  const ctx = useContext(AppContext);
  const user = ctx.auth.user;

  if (!user) return <AccessMessage title="Access Denied" message="Please login to continue." to="/login" />;
  if (user.role !== "trainer") {
    return <AccessMessage title="Access Denied" message="This dashboard is for trainers only." />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-grow px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-secondary">Trainer Dashboard</h1>
              <p className="mt-2 text-gray-600">Manage your uploaded courses and enrolled students</p>
            </div>
            <Link to="/trainerDashboard/add-course" className="btn btn-primary flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" />
              Add Course
            </Link>
          </header>

          {!user.approved ? (
            <div className="mb-8 flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <AlertCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-800">Pending Approval</p>
                <p className="text-sm text-yellow-700">
                  Your trainer account is awaiting admin approval. Once approved, you can upload and manage courses.
                </p>
              </div>
            </div>
          ) : null}

          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function TrainerCoursesPage() {
  const ctx = useContext(AppContext);
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    ctx.api.courses
      .list()
      .then((data) => {
        if (!cancelled) setCourses(data);
      })
      .catch((e) => {
        if (!cancelled) setMessage(e?.message || "Failed to load courses");
      });
    return () => {
      cancelled = true;
    };
  }, [ctx.api.courses]);

  if (message) return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{message}</div>;

  if (courses.length === 0) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
        <div className="max-w-md">
          <h2 className="text-2xl font-bold text-secondary">Start now</h2>
          <p className="mt-2 text-gray-600">Upload your first course and begin building your learner list.</p>
          <Link to="/trainerDashboard/add-course" className="btn btn-primary mt-6 inline-flex items-center gap-2 px-8 py-4 text-lg">
            <Plus className="h-5 w-5" />
            Add Your First Course
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-secondary">Uploaded Courses</h2>
        <span className="text-sm text-gray-500">{courses.length} total</span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Link key={course.id} to={`/trainerDashboard/courses/${course.id}`} className="card p-5 hover:border-gray-400">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-secondary line-clamp-2">{course.title}</h3>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">{course.description}</p>
              </div>
              <span className="badge badge-primary text-xs">{course.status || "pending"}</span>
            </div>
            <p className="mt-4 text-sm text-gray-500">Duration: {formatHoursMinutes(course.total_hours)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function TrainerCourseDetailPage() {
  const ctx = useContext(AppContext);
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([ctx.api.courses.get(courseId), ctx.api.courses.enrollments(courseId)])
      .then(([courseData, enrollmentData]) => {
        if (cancelled) return;
        setCourse(courseData);
        setEnrolledStudents(enrollmentData);
      })
      .catch((e) => {
        if (!cancelled) setMessage(e?.message || "Failed to load course");
      });
    return () => {
      cancelled = true;
    };
  }, [ctx.api.courses, courseId]);

  if (message) return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{message}</div>;
  if (!course) return <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-600">Loading course...</div>;

  return (
    <section className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-secondary">{course.title}</h2>
              <p className="mt-2 text-gray-600">{course.description}</p>
              <p className="mt-3 text-sm text-gray-500">
                {formatHoursMinutes(course.total_hours)} | {course.status || "pending"}
              </p>
            </div>
            <Link to={`/trainerDashboard/courses/${course.id}/edit`} className="btn btn-outline flex items-center justify-center gap-2">
              <Pencil className="h-4 w-4" />
              View or Modify
            </Link>
          </div>
        </div>

        <div className="card mt-6 p-6">
          <h3 className="font-bold text-secondary">Lessons</h3>
          {course.items?.length ? (
            <div className="mt-4 grid gap-3">
              {course.items.map((item, index) => (
                <div key={item.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex justify-between gap-4">
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
            <p className="mt-3 text-sm text-gray-500">No lessons added yet.</p>
          )}
        </div>
      </div>

      <aside className="card p-6">
        <h3 className="font-bold text-secondary">Enrolled Students</h3>
        {enrolledStudents.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">No students are enrolled yet.</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {enrolledStudents.map((enrollment) => (
              <div key={enrollment.id} className="rounded-lg border border-gray-200 p-3">
                <p className="text-sm font-medium text-secondary">
                  {enrollment.student?.name ||
                    enrollment.student?.username ||
                    enrollment.student?.email ||
                    `Student ${enrollment.student?.id}`}
                </p>
                <p className="mt-1 text-xs text-gray-500">{enrollment.student?.email || "-"}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Enrolled: {enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleString() : "-"}
                </p>
              </div>
            ))}
          </div>
        )}
      </aside>
    </section>
  );
}

export function TrainerCourseFormPage() {
  const ctx = useContext(AppContext);
  const navigate = useNavigate();
  const { courseId } = useParams();
  const isEditing = !!courseId;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [totalHours, setTotalHours] = useState("0.00");
  const [items, setItems] = useState([emptyItem()]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isEditing) return;
    let cancelled = false;
    ctx.api.courses
      .get(courseId)
      .then((detail) => {
        if (cancelled) return;
        setTitle(detail.title || "");
        setDescription(detail.description || "");
        setTotalHours(detail.total_hours || "0.00");
        setItems(detail.items?.length ? detail.items : [emptyItem()]);
      })
      .catch((e) => {
        if (!cancelled) setMessage(e?.message || "Failed to load course details");
      });
    return () => {
      cancelled = true;
    };
  }, [ctx.api.courses, courseId, isEditing]);

  const updateItem = (idx, field, value) => {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: value };
    setItems(next);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    const payload = {
      title,
      description,
      total_hours: totalHours,
      items: items
        .filter((x) => x.title && x.youtube_url)
        .map((x, idx) => ({
          title: x.title,
          description: x.description || "",
          youtube_url: x.youtube_url,
          hours: x.hours || "0.00",
          order: Number.isFinite(Number(x.order)) ? Number(x.order) : idx + 1,
        })),
    };

    try {
      if (isEditing) await ctx.api.courses.update(courseId, payload);
      else await ctx.api.courses.create(payload);
      navigate(isEditing ? `/trainerDashboard/courses/${courseId}` : "/trainerDashboard");
    } catch (err) {
      setMessage(err?.message || "Failed to save course");
    }
  }

  return (
    <section className="mx-auto max-w-3xl">
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-secondary">{isEditing ? "Modify Course" : "Create New Course"}</h2>
        {message ? <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{message}</div> : null}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">Course Title</span>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">Description</span>
            <textarea className="input min-h-20" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">Duration in decimal hours</span>
            <input className="input" type="number" step="0.5" min="0" value={totalHours} onChange={(e) => setTotalHours(e.target.value)} />
            <span className="mt-1 block text-xs text-gray-500">Displays as {formatHoursMinutes(totalHours)}.</span>
          </label>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-secondary">Course Lessons</h3>
              <button type="button" className="btn btn-secondary flex items-center gap-2 text-sm" onClick={() => setItems([...items, emptyItem()])}>
                <Plus className="h-4 w-4" />
                Add Lesson
              </button>
            </div>
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="rounded-lg border border-gray-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Lesson {idx + 1}</span>
                    {items.length > 1 ? (
                      <button type="button" className="text-red-600 hover:text-red-800" onClick={() => setItems(items.filter((_, i) => i !== idx))}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input className="input" placeholder="Lesson title" value={item.title} onChange={(e) => updateItem(idx, "title", e.target.value)} />
                    <input className="input" type="number" step="0.5" min="0" placeholder="Hours" value={item.hours} onChange={(e) => updateItem(idx, "hours", e.target.value)} />
                  </div>
                  <input className="input mt-3" placeholder="Lesson description" value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} />
                  <input className="input mt-3" type="url" placeholder="YouTube URL" value={item.youtube_url} onChange={(e) => updateItem(idx, "youtube_url", e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Link to={isEditing ? `/trainerDashboard/courses/${courseId}` : "/trainerDashboard"} className="btn btn-outline">
              Cancel
            </Link>
            <button className="btn btn-primary" type="submit">
              {isEditing ? "Update Course" : "Submit Course for Approval"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
