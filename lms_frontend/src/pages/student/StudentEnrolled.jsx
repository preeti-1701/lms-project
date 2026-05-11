import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../utils/api";
import "./StudentEnrolled.css";

const StudentEnrolled = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const studentName = localStorage.getItem("email") || "Student";
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/student/dashboard");
  };

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const res = await API.get("/courses/my-courses/");
      setCourses(res.data.courses || []);
    } catch (err) {
      console.log(err);
      setCourses([]);
    }
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setSelectedVideo(null);
  };

  const handleVideoClick = (video) => {
    window.open(video.youtube_url, '_blank', 'noopener,noreferrer');
  };

  const courseImages = {
    "Python": "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop",
    "Django": "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop",
    "React": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop"
  };

  return (
    <div className="enrolled-container">
      <button className="back-button" onClick={handleBack}>
        ← Back to Dashboard
      </button>
      <h2>My Courses</h2>

      {!selectedCourse ? (
        <div className="course-cards">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.id} className="course-card" onClick={() => handleCourseClick(course)}>
                <img 
                  src={course.image_url || courseImages[course.title] || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop"} 
                  alt={course.title} 
                  className="course-image" 
                />
                <div className="course-info">
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <p className="chapter-count">{course.videos.length} chapters</p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-courses-message">
              <p>No enrolled courses found.</p>
              <Link to="/student/dashboard/courses">Browse available courses</Link>
            </div>
          )}
        </div>
      ) : (
        <div className="course-detail">
          <button className="back-button" onClick={() => setSelectedCourse(null)}>
            Back to Courses
          </button>
          <h3>{selectedCourse.title}</h3>
          <p>{selectedCourse.description}</p>

          <div className="chapters-list">
            <h4>Chapters</h4>
            {selectedCourse.videos.length > 0 ? (
              selectedCourse.videos.map((video, index) => (
                <div key={video.id} className="chapter-item" onClick={() => handleVideoClick(video)}>
                  <div className="chapter-number">{index + 1}</div>
                  <div className="chapter-title">{video.title}</div>
                  <div className="chapter-description">{video.description}</div>
                </div>
              ))
            ) : (
              <p>No chapters available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentEnrolled;
