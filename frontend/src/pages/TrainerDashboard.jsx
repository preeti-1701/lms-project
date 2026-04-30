import { useContext, useEffect, useState } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { AppContext } from "../context/AppContext";

function emptyItem() {
  return { title: "", description: "", youtube_url: "", hours: "0.00", order: 0 };
}

export default function TrainerDashboard() {
  const ctx = useContext(AppContext);
  const user = ctx.auth.user;

  const [courses, setCourses] = useState([]);
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
        .map((x, idx) => ({ ...x, order: Number.isFinite(x.order) ? x.order : idx + 1 })),
    };

    await ctx.api.courses.create(payload);
    setTitle("");
    setDescription("");
    setTotalHours("0.00");
    setItems([emptyItem()]);
    await load();
    setSuccessMessage("Course submitted for admin approval.");
    setTimeout(() => setSuccessMessage(""), 3000);
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-secondary mb-2">Trainer Dashboard</h1>
          <p className="text-gray-600 mb-8">Create and manage your courses</p>

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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Course Form */}
            <div className="lg:col-span-2">
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-secondary mb-6">Create New Course</h2>
                <form onSubmit={handleCreate} className="space-y-6">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Hours</label>
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
                  </div>

                  {/* Lessons Section */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-secondary">Course Lessons</h3>
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="btn btn-secondary text-sm flex items-center gap-2"
                        disabled={!isApproved}
                      >
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
                                disabled={!isApproved}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3 mb-3">
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

                  <button
                    type="submit"
                    disabled={!isApproved}
                    className="w-full btn btn-primary"
                  >
                    Submit Course for Approval
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar - My Courses */}
            <div className="lg:col-span-1">
              <div className="card p-6">
                <h3 className="font-bold text-secondary mb-4">My Courses</h3>
                {courses.length === 0 ? (
                  <p className="text-gray-500 text-sm">You haven't created any courses yet.</p>
                ) : (
                  <div className="space-y-3">
                    {courses.map((course) => (
                      <div key={course.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-sm text-secondary line-clamp-2">{course.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{course.total_hours} hours</p>
                        <span className="inline-block mt-2 badge badge-primary text-xs">
                          {course.status || "pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
        <form onSubmit={handleCreate} style={{ display: "grid", gap: 8, opacity: isApproved ? 1 : 0.6 }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Main title"
            disabled={!isApproved}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Main description"
            disabled={!isApproved}
          />
          <input
            value={totalHours}
            onChange={(e) => setTotalHours(e.target.value)}
            placeholder="Total hours (e.g. 3.50)"
            disabled={!isApproved}
          />

          <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>YouTube Lessons</div>
            {items.map((it, idx) => (
              <div key={idx} style={{ display: "grid", gap: 6, marginBottom: 12 }}>
                <input
                  value={it.title}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...next[idx], title: e.target.value };
                    setItems(next);
                  }}
                  placeholder={`Lesson ${idx + 1} title`}
                  disabled={!isApproved}
                />
                <input
                  value={it.youtube_url}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...next[idx], youtube_url: e.target.value };
                    setItems(next);
                  }}
                  placeholder="YouTube URL"
                  disabled={!isApproved}
                />
                <input
                  value={it.hours}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...next[idx], hours: e.target.value };
                    setItems(next);
                  }}
                  placeholder="Hours (e.g. 1.00)"
                  disabled={!isApproved}
                />
                <textarea
                  value={it.description}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...next[idx], description: e.target.value };
                    setItems(next);
                  }}
                  placeholder="Lesson description"
                  disabled={!isApproved}
                />
              </div>
            ))}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => setItems([...items, { ...emptyItem(), order: items.length + 1 }])}
                disabled={!isApproved}>
                Add Lesson
              </button>
              <button
                type="button"
                onClick={() => setItems(items.length > 1 ? items.slice(0, -1) : items)}
                disabled={!isApproved || items.length <= 1}>
                Remove Last
              </button>
            </div>
          </div>

          <button type="submit" disabled={!isApproved || ctx.loading}>
            Submit for Approval
          </button>
        </form>
      </section>

      <section style={{ marginTop: 16 }}>
        <h3>My Courses</h3>
        <div style={{ display: "grid", gap: 12 }}>
          {courses.map((c) => (
            <div key={c.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{c.title}</div>
                  <div style={{ opacity: 0.85 }}>{c.description}</div>
                  <div style={{ opacity: 0.85 }}>Total hours: {c.total_hours}</div>
                </div>
                <div>
                  <div>
                    Status: <b>{c.status}</b>
                  </div>
                  {c.status === "rejected" && c.rejected_reason ? (
                    <div style={{ color: "crimson" }}>Reason: {c.rejected_reason}</div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
