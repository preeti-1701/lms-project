import { useContext, useEffect, useState } from "react";
import { Plus, Trash2, AlertCircle, Pencil } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { AppContext } from "../context/AppContext";
import { formatHoursMinutes } from "../utils/duration";

function emptyItem() {
  return { title: "", description: "", youtube_url: "", hours: "0.00", order: 0 };
}

export default function TrainerDashboard() {
  const ctx = useContext(AppContext);
  const user = ctx.auth.user;

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [totalHours, setTotalHours] = useState("0.00");
  const [items, setItems] = useState([emptyItem()]);

  const isTrainer = user?.role === "trainer";
  const isApproved = !!user?.approved;

  async function load() {
    setMessage("");
    const data = await ctx.api.courses.list();
    setCourses(data);
    if (selectedCourse) {
      const currentCourse = data.find((course) => course.id === selectedCourse.id);
      if (currentCourse) {
        setSelectedCourse(currentCourse);
      } else {
        setSelectedCourse(null);
        setEnrolledStudents([]);
      }
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
  }, [user?.id]);

  async function handleCreate(e) {
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

    const wasEditing = !!editingCourseId;
    if (editingCourseId) {
      await ctx.api.courses.update(editingCourseId, payload);
    } else {
      await ctx.api.courses.create(payload);
    }
    resetForm();
    await load();
    setSuccessMessage(wasEditing ? "Course updated and submitted for admin approval." : "Course submitted for admin approval.");
    setTimeout(() => setSuccessMessage(""), 3000);
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setTotalHours("0.00");
    setItems([emptyItem()]);
    setEditingCourseId(null);
    setShowCourseForm(false);
  }

  function openCreateForm() {
    setMessage("");
    setTitle("");
    setDescription("");
    setTotalHours("0.00");
    setItems([emptyItem()]);
    setEditingCourseId(null);
    setShowCourseForm(true);
  }

  const handleAddItem = () => {
    setItems([...items, emptyItem()]);
  };

  const handleRemoveItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleUpdateItem = (idx, field, value) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setItems(newItems);
  };

  async function handleSelectCourse(course) {
    setSelectedCourse(course);
    setEnrollmentsLoading(true);
    setMessage("");
    try {
      const data = await ctx.api.courses.enrollments(course.id);
      setEnrolledStudents(data);
    } catch (e) {
      setEnrolledStudents([]);
      setMessage(e?.message || "Failed to load enrolled students");
    } finally {
      setEnrollmentsLoading(false);
    }
  }

  async function handleModifyCourse(course) {
    setMessage("");
    try {
      const detail = await ctx.api.courses.get(course.id);
      setTitle(detail.title || "");
      setDescription(detail.description || "");
      setTotalHours(detail.total_hours || "0.00");
      setItems(detail.items?.length ? detail.items : [emptyItem()]);
      setEditingCourseId(detail.id);
      setShowCourseForm(true);
    } catch (e) {
      setMessage(e?.message || "Failed to load course details");
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600">Please login to continue.</p>
          <a href="/login" className="btn btn-primary mt-4">Go to Login</a>
        </div>
      </div>
    );
  }

  if (!isTrainer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600">This dashboard is for trainers only.</p>
          <a href="/" className="btn btn-primary mt-4">Go to Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-secondary mb-2">Trainer Dashboard</h1>
              <p className="text-gray-600">Manage your uploaded courses and enrolled students</p>
            </div>
            <button
              type="button"
              className="btn btn-primary flex items-center justify-center gap-2"
              onClick={openCreateForm}
              disabled={!isApproved}>
              <Plus className="h-4 w-4" />
              Add Course
            </button>
          </header>

          {!isApproved && (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800">Pending Approval</p>
                <p className="text-sm text-yellow-700">Your trainer account is awaiting admin approval. Once approved, you'll be able to upload and manage courses.</p>
              </div>
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {message}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
              {successMessage}
            </div>
          )}

          {courses.length === 0 && !showCourseForm ? (
            <div className="flex min-h-96 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
              <div className="max-w-md">
                <h2 className="text-2xl font-bold text-secondary">Start now</h2>
                <p className="mt-2 text-gray-600">Upload your first course and begin building your learner list.</p>
                <button
                  type="button"
                  className="btn btn-primary mt-6 inline-flex items-center gap-2 px-8 py-4 text-lg"
                  onClick={openCreateForm}
                  disabled={!isApproved}>
                  <Plus className="h-5 w-5" />
                  Add Your First Course
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <section className="lg:col-span-2">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-bold text-secondary">Uploaded Courses</h2>
                  <span className="text-sm text-gray-500">{courses.length} total</span>
                </div>

                {courses.length === 0 ? null : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {courses.map((course) => (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => handleSelectCourse(course)}
                        className={
                          selectedCourse?.id === course.id
                            ? "card border-primary p-5 text-left"
                            : "card p-5 text-left hover:border-gray-400"
                        }>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-secondary line-clamp-2">{course.title}</h3>
                            <p className="mt-2 text-sm text-gray-600 line-clamp-3">{course.description}</p>
                          </div>
                          <span className="badge badge-primary text-xs">{course.status || "pending"}</span>
                        </div>
                        <p className="mt-4 text-sm text-gray-500">Duration: {formatHoursMinutes(course.total_hours)}</p>
                      </button>
                    ))}
                  </div>
                )}

                {selectedCourse ? (
                  <div className="card mt-8 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-secondary">{selectedCourse.title}</h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {formatHoursMinutes(selectedCourse.total_hours)} | {selectedCourse.status || "pending"}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline flex items-center justify-center gap-2"
                        onClick={() => handleModifyCourse(selectedCourse)}>
                        <Pencil className="h-4 w-4" />
                        View or Modify
                      </button>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-bold text-secondary">Enrolled Students</h4>
                      {enrollmentsLoading ? (
                        <p className="mt-3 text-sm text-gray-500">Loading enrolled students...</p>
                      ) : enrolledStudents.length === 0 ? (
                        <p className="mt-3 text-sm text-gray-500">No students are enrolled yet.</p>
                      ) : (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
                                Enrolled:{" "}
                                {enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleString() : "-"}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
                    Select a course to view enrolled students and course actions.
                  </div>
                )}
              </section>

              {showCourseForm ? (
                <aside className="lg:col-span-1">
                  <div className="card p-6">
                    <div className="mb-6 flex items-center justify-between gap-3">
                      <h2 className="text-xl font-bold text-secondary">
                        {editingCourseId ? "Modify Course" : "Create New Course"}
                      </h2>
                      <button type="button" className="btn btn-outline text-sm" onClick={resetForm}>
                        Cancel
                      </button>
                    </div>
                    <form onSubmit={handleCreate} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter course title"
                          className="input"
                          required
                          disabled={!isApproved}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe your course"
                          className="input min-h-20"
                          required
                          disabled={!isApproved}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration in decimal hours
                        </label>
                        <input
                          type="number"
                          value={totalHours}
                          onChange={(e) => setTotalHours(e.target.value)}
                          placeholder="0.00"
                          className="input"
                          step="0.5"
                          min="0"
                          disabled={!isApproved}
                        />
                        <p className="mt-1 text-xs text-gray-500">Displays as {formatHoursMinutes(totalHours)}.</p>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold text-secondary">Course Lessons</h3>
                          <button
                            type="button"
                            onClick={handleAddItem}
                            className="btn btn-secondary text-sm flex items-center gap-2"
                            disabled={!isApproved}>
                            <Plus className="w-4 h-4" />
                            Add Lesson
                          </button>
                        </div>

                        <div className="space-y-4">
                          {items.map((item, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-medium text-gray-600">Lesson {idx + 1}</span>
                                {items.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(idx)}
                                    className="text-red-600 hover:text-red-800 transition"
                                    disabled={!isApproved}>
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-1 gap-3 mb-3">
                                <input
                                  type="text"
                                  placeholder="Lesson title"
                                  value={item.title}
                                  onChange={(e) => handleUpdateItem(idx, "title", e.target.value)}
                                  className="input"
                                  disabled={!isApproved}
                                />
                                <input
                                  type="number"
                                  placeholder="Hours"
                                  value={item.hours}
                                  onChange={(e) => handleUpdateItem(idx, "hours", e.target.value)}
                                  className="input"
                                  step="0.5"
                                  min="0"
                                  disabled={!isApproved}
                                />
                              </div>
                              <input
                                type="text"
                                placeholder="Lesson description"
                                value={item.description}
                                onChange={(e) => handleUpdateItem(idx, "description", e.target.value)}
                                className="input mb-3"
                                disabled={!isApproved}
                              />
                              <input
                                type="url"
                                placeholder="YouTube URL (https://www.youtube.com/watch?v=...)"
                                value={item.youtube_url}
                                onChange={(e) => handleUpdateItem(idx, "youtube_url", e.target.value)}
                                className="input"
                                disabled={!isApproved}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <button type="submit" disabled={!isApproved} className="w-full btn btn-primary">
                        {editingCourseId ? "Update Course" : "Submit Course for Approval"}
                      </button>
                    </form>
                  </div>
                </aside>
              ) : null}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

