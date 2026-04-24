import { useState, useEffect } from "react";
import API from "../services/api";

export default function CourseFormModal({ onClose, course, refresh }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    youtube_link: "",
  });

  // ✅ Pre-fill when editing
  useEffect(() => {
    if (course) {
      setForm({
        title: course.title,
        description: course.description,
        youtube_link: course.youtube_link,
      });
    }
  }, [course]);

  const handleSubmit = async () => {
    try {
      if (course) {
        // ✏️ UPDATE
        await API.put(`/users/update-course/${course.id}/`, form);
      } else {
        // ➕ ADD
        await API.post("/users/add-course/", form);
      }

      refresh();   // 🔄 reload dashboard
      onClose();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-[400px]">

        <h2 className="font-bold mb-4">
          {course ? "Edit Course" : "Add Course"}
        </h2>

        <input
          value={form.title}
          placeholder="Title"
          className="w-full mb-2 border p-2"
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <input
          value={form.description}
          placeholder="Description"
          className="w-full mb-2 border p-2"
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <input
          value={form.youtube_link}
          placeholder="YouTube Link"
          className="w-full mb-4 border p-2"
          onChange={(e) => setForm({ ...form, youtube_link: e.target.value })}
        />

        <button
          onClick={handleSubmit}
          className="bg-black text-white px-4 py-2 rounded w-full"
        >
          Save
        </button>

      </div>
    </div>
  );
}