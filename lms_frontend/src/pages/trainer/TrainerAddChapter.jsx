import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../utils/api";
import "./TrainerAddChapter.css";

const TrainerAddChapter = () => {
  const { courseId } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    youtube_url: ""
  });
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        console.log("Fetching course for add chapter, courseId:", courseId);
        const res = await API.get(`/courses/${courseId}/`);
        console.log("Course data:", res.data);
        setCourse(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching course:", err);
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

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
      navigate(`/trainer/dashboard/course/${courseId}`);
    } catch (err) {
      alert("Failed to add chapter");
      console.error("Error adding chapter:", err);
    }
  };

  return (
    <div className="add-chapter-container">
      {loading ? (
        <p>Loading course...</p>
      ) : (
        <>
          {course && (
            <div className="course-header">
              <img 
                src={course.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop"} 
                alt={course.title} 
                className="course-image"
              />
              <div className="course-info">
                <h3>{course.title}</h3>
                <p>{course.description}</p>
              </div>
            </div>
          )}
          <h2>Add Chapter</h2>
          <form onSubmit={handleSubmit} className="add-chapter-form">
            <div className="form-group">
              <label>Chapter Title:</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter chapter title"
              />
            </div>
            <div className="form-group">
              <label>YouTube URL:</label>
              <input
                type="text"
                name="youtube_url"
                value={formData.youtube_url}
                onChange={handleChange}
                required
                placeholder="Enter YouTube URL"
              />
            </div>
            <button type="submit" className="submit-button">
              Add Chapter
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default TrainerAddChapter;
