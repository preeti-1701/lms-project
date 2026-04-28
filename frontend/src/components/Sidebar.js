import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="sidebar">
      <h2 className="logo">🎓 LMS</h2>

      <Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""}>
        Dashboard
      </Link>

      <Link to="/courses" className={location.pathname === "/courses" ? "active" : ""}>
        Courses
      </Link>
    </div>
  );
}