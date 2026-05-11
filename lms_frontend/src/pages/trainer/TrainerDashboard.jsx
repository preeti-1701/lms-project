import { Outlet, Link, useNavigate } from "react-router-dom";
import "../student/StudentDashboard.css";

const TrainerDashboard = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    navigate("/trainer/login");
  };

  const trainerName = localStorage.getItem("email") || "Trainer";
  const trainerEmail = localStorage.getItem("email") || "trainer@example.com";

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <h3>Trainer Dashboard</h3>
        <nav>
          <Link to="/trainer/dashboard/courses">My Courses</Link>
          <Link to="/trainer/dashboard/enrollment-requests">Enrollment Requests</Link>
        </nav>
      </div>
      <div className="dashboard-content">
        <Outlet />
      </div>
      <div className="profile-icon">
        <div className="profile-avatar">
          {trainerName.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <p className="profile-name">{trainerName}</p>
          <p className="profile-email">{trainerEmail}</p>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
