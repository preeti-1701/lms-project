import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { AppContext } from "../context/AppContext";

function emptyItem() {
  return { title: "", description: "", youtube_url: "", hours: "0.00", order: 0 };
}

export default function TrainerDashboard() {
  const ctx = useContext(AppContext);
  const user = ctx.auth.user;

  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState("");

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
    load().catch((e) => setMessage(e?.message || "Failed to load"));
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
    setMessage("Course submitted for admin approval.");
  }

  if (!user) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Trainer Dashboard</h2>
        <p>
          Please <Link to="/">login</Link>.
        </p>
      </div>
    );
  }

  if (!isTrainer) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Trainer Dashboard</h2>
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
        <h2>Trainer Dashboard</h2>
        <button onClick={() => ctx.actions.logout()}>Logout</button>
      </header>

      {!isApproved ? (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
          <b>Pending approval:</b> Your trainer account must be approved by an admin before you can upload/manage
          courses.
        </div>
      ) : null}

      {message ? (
        <div style={{ marginTop: 12, color: message.includes("failed") ? "crimson" : "green" }}>{message}</div>
      ) : null}

      <section style={{ marginTop: 16 }}>
        <h3>Create Course</h3>
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
