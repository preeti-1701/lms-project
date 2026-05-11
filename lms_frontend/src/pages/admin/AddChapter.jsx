import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../utils/api";

const AddChapter = () => {
  const { courseId } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    youtube_url: ""
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/courses/add-chapter/", {
        course_id: courseId,
        ...formData
      });
      alert("Chapter added successfully");
      navigate(`/admin/course/${courseId}`);
    } catch (err) {
      alert("Failed to add chapter");
      console.error("Error adding chapter:", err);
    }
  };

  return (
    <div>
      <h2>Add Chapter</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Chapter Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>YouTube URL:</label>
          <input
            type="text"
            name="youtube_url"
            value={formData.youtube_url}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
          />
        </div>
        <button
          type="submit"
          style={{
            backgroundColor: "#28a745",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Add Chapter
        </button>
      </form>
    </div>
  );
};

export default AddChapter;
