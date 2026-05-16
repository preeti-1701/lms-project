import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../../utils/api";
import "../../pages/courseDetails.css";

const TrainerCourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingChapter, setEditingChapter] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", youtube_url: "" });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        console.log("Fetching course details for id:", id);
        const res = await API.get(`/courses/${id}/`);
        console.log("Course details response:", res.data);
        setCourse(res.data);
      } catch (e) {
        console.error("Error fetching course details:", e);
        setError("Failed to load course");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const deleteChapter = async (chapterId) => {
    if (window.confirm("Are you sure you want to delete this chapter?")) {
      try {
        await API.post(`/courses/delete-chapter/${chapterId}/`);
        alert("Chapter deleted successfully");
        const res = await API.get(`/courses/${id}/`);
        setCourse(res.data);
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
      const res = await API.get(`/courses/${id}/`);
      setCourse(res.data);
    } catch (err) {
      setError("Failed to update chapter");
      console.error("Error updating chapter:", err);
    }
  };

  if (loading) return <p className="status">Loading...</p>;
  if (error) return <p className="status error">{error}</p>;
  if (!course) return <p className="status error">Course not found</p>;

  return (
    <div className="course-details">
      <div className="course-hero">
        <img
          className="course-image"
          src={course.image_url || "https://via.placeholder.com/800x320"}
          alt={course.title}
        />
        <div className="course-meta">
          <h2>{course.title}</h2>
          <p className="course-desc">{course.description}</p>
          <p className="course-sub">
            Status: {course.status || "ongoing"} • Chapters: {course.chapter_count ?? (course.chapters?.length || 0)}
          </p>
        </div>
      </div>

      <Link to={`/trainer/dashboard/add-chapter/${id}`} style={{ display: "inline-block", padding: "10px 20px", backgroundColor: "#28a745", color: "white", textDecoration: "none", borderRadius: "5px", marginBottom: "20px" }}>
        Add Chapter
      </Link>

      <div className="chapters">
        <h3>Chapters</h3>
        {course.chapters && course.chapters.length > 0 ? (
          <div className="chapter-list">
            {course.chapters.map((ch, idx) => (
              <div className="chapter-item" key={ch.id}>
                {editingChapter === ch.id ? (
                  <div style={{ width: "100%" }}>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      style={{ width: "100%", padding: "5px", marginBottom: "5px" }}
                      placeholder="Chapter title"
                    />
                    <input
                      type="text"
                      value={editForm.youtube_url}
                      onChange={(e) => setEditForm({ ...editForm, youtube_url: e.target.value })}
                      style={{ width: "100%", padding: "5px", marginBottom: "5px" }}
                      placeholder="YouTube URL"
                    />
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button onClick={() => saveChapter(ch.id)} style={{ backgroundColor: "#28a745", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}>
                        Save
                      </button>
                      <button onClick={cancelEditChapter} style={{ backgroundColor: "#6c757d", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div>
                      <b>
                        {idx + 1}. {ch.title}
                      </b>
                      <div className="chapter-url">{ch.youtube_url}</div>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        className="chapter-watch"
                        onClick={() =>
                          window.open(ch.youtube_url, "_blank")
                        }
                      >
                        Watch
                      </button>
                      <button
                        onClick={() => startEditChapter(ch)}
                        style={{ backgroundColor: "#ffc107", color: "black", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteChapter(ch.id)}
                        style={{ backgroundColor: "#dc3545", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No chapters added yet.</p>
        )}
      </div>
    </div>
  );
};

export default TrainerCourseDetails;
