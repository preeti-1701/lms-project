import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../utils/api";

const AdminCourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingVideo, setEditingVideo] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", video_url: "" });

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const courseResponse = await API.get(`/courses/${id}/`);
      setCourse(courseResponse.data);
      
      const videosResponse = await API.get(`/course/${id}/video/`);
      setVideos(videosResponse.data.videos || []);
    } catch (err) {
      setError("Failed to fetch course details");
      console.error("Error fetching course details:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteChapter = async (videoId) => {
    if (window.confirm("Are you sure you want to delete this chapter?")) {
      try {
        await API.post(`/delete-chapter/${videoId}/`);
        alert("Chapter deleted successfully");
        fetchCourseDetails();
      } catch (err) {
        setError("Failed to delete chapter");
        console.error("Error deleting chapter:", err);
      }
    }
  };

  const startEditChapter = (video) => {
    setEditingVideo(video.id);
    setEditForm({ title: video.title, video_url: video.video_url });
  };

  const cancelEditChapter = () => {
    setEditingVideo(null);
    setEditForm({ title: "", video_url: "" });
  };

  const saveChapter = async (videoId) => {
    try {
      await API.post(`/update-chapter/${videoId}/`, editForm);
      alert("Chapter updated successfully");
      setEditingVideo(null);
      setEditForm({ title: "", video_url: "" });
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
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      <p>Status: {course.status}</p>

      <Link to={`/admin/course/${id}/edit`} style={{ display: "inline-block", padding: "10px 20px", backgroundColor: "#ffc107", color: "black", textDecoration: "none", borderRadius: "5px", marginBottom: "20px" }}>
        Edit Course
      </Link>

      <Link to={`/admin/add-chapter/${id}`}>Add Chapter</Link>

      <h4>Chapters/Videos</h4>
      {videos.length === 0 ? (
        <p>No chapters added yet.</p>
      ) : (
        videos.map((video) => (
          <div key={video.id} style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}>
            {editingVideo === video.id ? (
              <div>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  style={{ width: "100%", padding: "5px", marginBottom: "5px" }}
                  placeholder="Chapter title"
                />
                <input
                  type="text"
                  value={editForm.video_url}
                  onChange={(e) => setEditForm({ ...editForm, video_url: e.target.value })}
                  style={{ width: "100%", padding: "5px", marginBottom: "5px" }}
                  placeholder="Video URL"
                />
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => saveChapter(video.id)} style={{ backgroundColor: "#28a745", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}>
                    Save
                  </button>
                  <button onClick={cancelEditChapter} style={{ backgroundColor: "#6c757d", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h5>{video.title}</h5>
                <a href={video.video_url} target="_blank" rel="noopener noreferrer">
                  Watch Video
                </a>
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button 
                    onClick={() => startEditChapter(video)} 
                    style={{ marginLeft: "10px", backgroundColor: "#ffc107", color: "black", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteChapter(video.id)} 
                    style={{ marginLeft: "10px", backgroundColor: "#ff4444", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
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
