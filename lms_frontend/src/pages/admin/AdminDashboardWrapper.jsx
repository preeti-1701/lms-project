import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import "../student/StudentDashboard.css";

const AdminDashboardWrapper = () => {
  const navigate = useNavigate();
  const adminName = localStorage.getItem("email") || "Admin";
  const adminEmail = localStorage.getItem("email") || "admin@example.com";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    navigate("/admin/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <h3>Admin Dashboard</h3>
        <nav>
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/dashboard/create-course">Add Course</Link>
          <Link to="/admin/dashboard/courses">Manage Courses</Link>
          <Link to="/admin/dashboard/students">Manage Students</Link>
          <Link to="/admin/dashboard/trainers">Manage Trainers</Link>
          <Link to="/admin/dashboard/sessions">Sessions</Link>
          <Link to="/admin/dashboard/enrollment-requests">Enrollment Requests</Link>
        </nav>
      </div>
      <div className="dashboard-content">
        <Outlet />
      </div>
      <div className="profile-icon">
        <div className="profile-avatar">
          {adminName.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <p className="profile-name">{adminName}</p>
          <p className="profile-email">{adminEmail}</p>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardWrapper;
