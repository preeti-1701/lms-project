import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../utils/api";
import SecureVideoPlayer from "../components/SecureVideoPlayer";
import "./courseDetails.css";

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await API.get(`/courses/${id}/`);
        setCourse(res.data);
      } catch (e) {
        setError("Failed to load course");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) return <p className="status">Loading...</p>;
  if (error) return <p className="status error">{error}</p>;
  if (!course) return <p className="status error">Course not found</p>;

  return (
    <div className="course-details">
      <div className="course-hero">
        <img
          className="course-image"
          src={course.image ? `http://127.0.0.1:8000${course.image}` : "https://via.placeholder.com/800x320"}
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

      <div className="chapters">
        <h3>Chapters</h3>
        {course.chapters && course.chapters.length > 0 ? (
          <div className="chapter-list">
            {course.chapters.map((ch, idx) => (
              <div className="chapter-item" key={ch.id}>
                <div>
                  <b>
                    {idx + 1}. {ch.title}
                  </b>
                  <div className="chapter-url">{ch.youtube_url}</div>
                </div>
                <div className="video-container">
                  <SecureVideoPlayer 
                    videoUrl={ch.youtube_url} 
                    title={ch.title}
                    userEmail={localStorage.getItem('email') || 'user@example.com'}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>
            {course.enrollment_status === "approved"
              ? "No chapters added yet."
              : "Videos are available only after enrollment is approved."}
          </p>
        )}
      </div>
    </div>
  );
};

export default CourseDetails;
