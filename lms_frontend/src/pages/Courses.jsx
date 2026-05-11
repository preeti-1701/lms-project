import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../utils/api";
import "./courses.css";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await API.get("/courses/");
        setCourses(res.data.courses || []);
      } catch (err) {
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const courseImages = {
    "Python": "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop",
    "Django": "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop",
    "React": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop"
  };

  if (loading) return <p className="status">Loading courses...</p>;
  if (error) return <p className="status error">{error}</p>;

  return (
    <div className="courses-container">
      <h2>All Courses</h2>

      <div className="course-cards">
        {courses.length === 0 ? (
          <p>No courses available</p>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="course-card">
              <img 
                src={courseImages[course.title] || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop"} 
                alt={course.title} 
                className="course-image" 
              />
              <div className="course-info">
                <h3>{course.title}</h3>
                <p>{course.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Courses;
