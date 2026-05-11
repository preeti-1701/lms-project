import { Link } from "react-router-dom";
import "./TrainerDashboardLanding.css";

const TrainerDashboardLanding = () => {
  const trainerName = localStorage.getItem("email") || "Trainer";

  return (
    <div className="dashboard-landing-container">
      <div className="welcome-banner">
        <h1>Welcome back, {trainerName.split('@')[0]}! 👋</h1>
        <p>Manage your courses and help students learn</p>
      </div>
      
      <div className="dashboard-cards">
        <Link to="/trainer/dashboard/courses" className="dashboard-card">
          <div className="card-icon">📚</div>
          <h3>My Courses</h3>
          <p>Manage your courses and chapters</p>
        </Link>
        
        <Link to="/trainer/dashboard/enrollment-requests" className="dashboard-card">
          <div className="card-icon">📝</div>
          <h3>Enrollment Requests</h3>
          <p>Approve or reject enrollment requests</p>
        </Link>
      </div>
    </div>
  );
};

export default TrainerDashboardLanding;
