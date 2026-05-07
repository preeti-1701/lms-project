import { Link } from "react-router-dom";

import "./Sidebar.css";

export default function Sidebar() {

  const role =
    localStorage.getItem("role");

  return (

    <div className="sidebar">

      <h2>LMS</h2>

      <Link to="/">
        Dashboard
      </Link>

      {(role === "admin" ||
        role === "trainer") && (

        <Link to="/courses">
          Courses
        </Link>
      )}

      {role === "admin" && (

        <Link to="/admin-dashboard">
          Admin Panel
        </Link>
      )}

    </div>
  );
}