import { Outlet, Link, useNavigate } from "react-router-dom";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    navigate("/student/login");
  };

  const studentName = localStorage.getItem("email") || "Student";
  const studentEmail = localStorage.getItem("email") || "student@example.com";

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <h3>Student Dashboard</h3>
        <nav>
          <Link to="/student/dashboard/courses">All Courses</Link>
          <Link to="/student/dashboard/enrolled">My Courses</Link>
        </nav>
      </div>
      <div className="dashboard-content">
        <Outlet />
      </div>
      <div className="profile-icon">
        <div className="profile-avatar">
          {studentName.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <p className="profile-name">{studentName}</p>
          <p className="profile-email">{studentEmail}</p>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
