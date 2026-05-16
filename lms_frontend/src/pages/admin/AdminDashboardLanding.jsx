import { Link } from "react-router-dom";
import "../student/StudentDashboardLanding.css";

const AdminDashboardLanding = () => {
  const adminName = localStorage.getItem("email") || "Admin";

  const quickLinks = [
    { label: "Add Course", to: "/admin/dashboard/create-course", color: "#28a745", icon: "📚" },
    { label: "Manage Courses", to: "/admin/dashboard/courses", color: "#007bff", icon: "🗂️" },
    { label: "Manage Students", to: "/admin/dashboard/students", color: "#6f42c1", icon: "🎓" },
    { label: "Manage Trainers", to: "/admin/dashboard/trainers", color: "#fd7e14", icon: "👨‍🏫" },
    { label: "Active Sessions", to: "/admin/dashboard/sessions", color: "#17a2b8", icon: "🔐" },
    { label: "Enrollment Requests", to: "/admin/dashboard/enrollment-requests", color: "#dc3545", icon: "📋" },
  ];

  return (
    <div className="dashboard-landing-container">
      <div className="welcome-banner">
        <h1>Welcome back, {adminName.split("@")[0]}! 👋</h1>
        <p>Manage courses, users, and monitor the platform from here.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginTop: "24px" }}>
        {quickLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px 16px",
              backgroundColor: link.color,
              color: "white",
              textDecoration: "none",
              borderRadius: "10px",
              fontWeight: "bold",
              fontSize: "15px",
              gap: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              transition: "transform 0.15s, box-shadow 0.15s"
            }}
            onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)"; }}
            onMouseOut={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)"; }}
          >
            <span style={{ fontSize: "28px" }}>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboardLanding;
