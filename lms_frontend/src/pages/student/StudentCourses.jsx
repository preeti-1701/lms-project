import { useEffect, useState } from "react";
import API from "../../utils/api";
import { useNavigate } from "react-router-dom";
import "./StudentCourses.css";

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const studentName = localStorage.getItem("email") || "Student";
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/student/dashboard");
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      console.log("Fetching courses...");
      const res = await API.get("/courses/");
      console.log("Courses response:", res.data);
      setCourses(res.data.courses || []);
      setLoading(false);
    } catch (err) {
      console.log("Error fetching courses:", err);
      setCourses([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const enrollCourse = async (id) => {
    try {
      await API.post(`/courses/enroll/${id}/`);
      alert("Enrollment request sent. Waiting for approval.");
      fetchCourses();
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.error || "Enrollment failed");
    }
  };

  const getButtonText = (status) => {
    switch(status) {
      case 'approved':
        return 'View Course';
      case 'pending':
        return 'Pending Approval';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Enroll';
    }
  };

  const courseImages = {
    "Python": "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop",
    "Django": "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop",
    "React": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop"
  };

  return (
    <div className="student-courses-container">
      <button className="back-button" onClick={handleBack}>
        ← Back to Dashboard
      </button>
      <h2>Available Courses</h2>

      <div className="course-cards">
        {courses.length > 0 ? (
          courses.map(c => (
            <div key={c.id} className="course-card">
              <img 
                src={c.image_url || courseImages[c.title] || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop"} 
                alt={c.title} 
                className="course-image" 
              />
              <div className="course-info">
                <h3>{c.title}</h3>
                <p>{c.description}</p>
                <p className="enrollment-status">
                  Status: <span className={`status-${c.enrollment_status || 'not_enrolled'}`}>
                    {c.enrollment_status ? c.enrollment_status.charAt(0).toUpperCase() + c.enrollment_status.slice(1) : 'Not Enrolled'}
                  </span>
                </p>
                {c.enrollment_status === 'approved' ? (
                  <button className="view-button" onClick={() => navigate("/student/dashboard/enrolled")}>
                    View Course
                  </button>
                ) : c.enrollment_status === 'pending' ? (
                  <button className="pending-button" disabled>
                    Pending Approval
                  </button>
                ) : c.enrollment_status === 'rejected' ? (
                  <button className="rejected-button" disabled>
                    Rejected
                  </button>
                ) : (
                  <button className="enroll-button" onClick={() => enrollCourse(c.id)}>Enroll</button>
                )}
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

export default StudentCourses;
