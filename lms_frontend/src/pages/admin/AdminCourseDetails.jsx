import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../utils/api";

const AdminCourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingChapter, setEditingChapter] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", youtube_url: "" });

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const res = await API.get(`/courses/${id}/`);
      setCourse(res.data);
    } catch (err) {
      setError("Failed to fetch course details");
      console.error("Error fetching course details:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteChapter = async (chapterId) => {
    if (window.confirm("Are you sure you want to delete this chapter?")) {
      try {
        await API.post(`/courses/delete-chapter/${chapterId}/`);
        alert("Chapter deleted successfully");
        fetchCourseDetails();
      } catch (err) {
        setError("Failed to delete chapter");
        console.error("Error deleting chapter:", err);
      }
    }
  };

  const startEditChapter = (chapter) => {
    setEditingChapter(chapter.id);
    setEditForm({ title: chapter.title, youtube_url: chapter.youtube_url });
  };

  const cancelEditChapter = () => {
    setEditingChapter(null);
    setEditForm({ title: "", youtube_url: "" });
  };

  const saveChapter = async (chapterId) => {
    try {
      await API.put(`/courses/update-chapter/${chapterId}/`, editForm);
      alert("Chapter updated successfully");
      setEditingChapter(null);
      setEditForm({ title: "", youtube_url: "" });
      fetchCourseDetails();
    } catch (err) {
      setError("Failed to update chapter");
      console.error("Error updating chapter:", err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!course) return <div>Course not found</div>;

  return (
    <div>
      <h2>Course Details</h2>
      {course.image_url && (
        <img
          src={course.image_url}
          alt={course.title}
          style={{ width: "100%", maxHeight: "240px", objectFit: "cover", borderRadius: "8px", marginBottom: "16px" }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
      )}
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      <p>Status: <strong>{course.status || "ongoing"}</strong></p>
      <p>Chapters: <strong>{course.chapter_count ?? (course.chapters?.length || 0)}</strong></p>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <Link
          to={`/admin/dashboard/course/${id}/edit`}
          style={{ display: "inline-block", padding: "8px 16px", backgroundColor: "#ffc107", color: "black", textDecoration: "none", borderRadius: "5px" }}
        >
          Edit Course
        </Link>
        <Link
          to={`/admin/dashboard/add-chapter/${id}`}
          style={{ display: "inline-block", padding: "8px 16px", backgroundColor: "#28a745", color: "white", textDecoration: "none", borderRadius: "5px" }}
        >
          Add Chapter
        </Link>
      </div>

      <h4>Chapters / Videos</h4>
      {!course.chapters || course.chapters.length === 0 ? (
        <p>No chapters added yet.</p>
      ) : (
        course.chapters.map((chapter, idx) => (
          <div key={chapter.id} style={{ border: "1px solid #ccc", padding: "12px", margin: "10px 0", borderRadius: "6px" }}>
            {editingChapter === chapter.id ? (
              <div>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  style={{ width: "100%", padding: "6px", marginBottom: "6px", borderRadius: "4px", border: "1px solid #ddd" }}
                  placeholder="Chapter title"
                />
                <input
                  type="text"
                  value={editForm.youtube_url}
                  onChange={(e) => setEditForm({ ...editForm, youtube_url: e.target.value })}
                  style={{ width: "100%", padding: "6px", marginBottom: "6px", borderRadius: "4px", border: "1px solid #ddd" }}
                  placeholder="YouTube URL"
                />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => saveChapter(chapter.id)} style={{ backgroundColor: "#28a745", color: "white", border: "none", padding: "5px 12px", borderRadius: "4px", cursor: "pointer" }}>
                    Save
                  </button>
                  <button onClick={cancelEditChapter} style={{ backgroundColor: "#6c757d", color: "white", border: "none", padding: "5px 12px", borderRadius: "4px", cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h5 style={{ margin: "0 0 6px 0" }}>{idx + 1}. {chapter.title}</h5>
                <a href={chapter.youtube_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "#007bff", wordBreak: "break-all" }}>
                  {chapter.youtube_url}
                </a>
                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                  <button
                    onClick={() => startEditChapter(chapter)}
                    style={{ backgroundColor: "#ffc107", color: "black", border: "none", padding: "5px 12px", borderRadius: "4px", cursor: "pointer" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteChapter(chapter.id)}
                    style={{ backgroundColor: "#dc3545", color: "white", border: "none", padding: "5px 12px", borderRadius: "4px", cursor: "pointer" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AdminCourseDetails;
