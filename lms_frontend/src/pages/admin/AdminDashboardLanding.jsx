import { Link } from "react-router-dom";
import "../student/StudentDashboardLanding.css";

const AdminDashboardLanding = () => {
  const adminName = localStorage.getItem("email") || "Admin";

  return (
    <div className="dashboard-landing-container">
      <div className="welcome-banner">
        <h1>Welcome back, {adminName.split('@')[0]}! 👋</h1>
        <p>Manage courses, users, and monitor the platform</p>
      </div>
    </div>
  );
};

export default AdminDashboardLanding;
