import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/api";
import "./TrainerCourses.css";

const TrainerCourses = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await API.get("/courses/");
        console.log("Trainer courses response:", res.data);
        console.log("Courses with images:", res.data.courses);
        setCourses(res.data.courses || []);
      } catch (err) {
        console.log(err);
        setCourses([]);
      }
    };
    fetchCourses();
  }, []);

  const courseImages = {
    "Python": "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop",
    "Django": "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop",
    "React": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop"
  };

  const getImageUrl = (course) => {
    return course.image_url || courseImages[course.title] || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop";
  };

  const handleImageError = (e) => {
    e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop";
  };

  return (
    <div className="trainer-courses-container">
      <h2>My Courses</h2>

      <div className="course-cards">
        {courses.length > 0 ? (
          courses.map(c => (
            <div key={c.id} className="course-card">
              <img 
                src={getImageUrl(c)} 
                alt={c.title} 
                className="course-image" 
                onError={handleImageError}
              />
              <div className="course-info">
                <h3>{c.title}</h3>
                <p>{c.description}</p>
                <button className="add-chapter-button" onClick={() => navigate(`/trainer/dashboard/course/${c.id}`)}>
                  Add Chapter
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No courses available</p>
        )}
      </div>
    </div>
  );
};

export default TrainerCourses;
