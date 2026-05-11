import { Link } from "react-router-dom";
import "./StudentDashboardLanding.css";

const StudentDashboardLanding = () => {
  const studentName = localStorage.getItem("email") || "Student";

  return (
    <div className="dashboard-landing-container">
      <div className="welcome-banner">
        <h1>Welcome back, {studentName.split('@')[0]}! 👋</h1>
        <p>Ready to learn something new today?</p>
      </div>
      
      <div className="dashboard-cards">
        <Link to="/student/dashboard/courses" className="dashboard-card">
          <div className="card-icon">📚</div>
          <h3>Available Courses</h3>
          <p>Browse and enroll in courses</p>
        </Link>
        
        <Link to="/student/dashboard/enrolled" className="dashboard-card">
          <div className="card-icon">🎓</div>
          <h3>My Courses</h3>
          <p>View your enrolled courses</p>
        </Link>
      </div>
    </div>
  );
};

export default StudentDashboardLanding;
