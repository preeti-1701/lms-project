import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../utils/api";

const AdminEditCourse = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "ongoing",
    image_url: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await API.get(`/courses/${id}/`);
      const course = response.data;
      setFormData({
        title: course.title || "",
        description: course.description || "",
        status: course.status || "ongoing",
        image_url: course.image_url || ""
      });
    } catch (err) {
      console.error("Error fetching course:", err);
      alert("Failed to load course details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post(`/courses/admin/${id}/update/`, formData);
      alert("Course updated successfully");
      navigate("/admin/dashboard/courses");
    } catch (err) {
      alert("Failed to update course: " + (err.response?.data?.error || err.message));
      console.error("Error updating course:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Edit Course</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: "600px" }}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", minHeight: "100px", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Status:</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
          >
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Course Image URL:</label>
          <input
            type="url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box" }}
          />
          {formData.image_url && (
            <img
              src={formData.image_url}
              alt="Preview"
              style={{ marginTop: "8px", width: "100%", maxHeight: "160px", objectFit: "cover", borderRadius: "4px" }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          )}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              backgroundColor: saving ? "#aaa" : "#ffc107",
              color: "black",
              padding: "10px 24px",
              border: "none",
              borderRadius: "4px",
              cursor: saving ? "not-allowed" : "pointer",
              fontSize: "15px"
            }}
          >
            {saving ? "Saving..." : "Update Course"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard/courses")}
            style={{ backgroundColor: "#6c757d", color: "white", padding: "10px 24px", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "15px" }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminEditCourse;
