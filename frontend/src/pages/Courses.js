import { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./Courses.css";

export default function Courses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get("courses/all/")
      .then(res => setCourses(res.data));
  }, []);

  return (   // ✅ return must be INSIDE function
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div className="courses-container">
        <h2 className="courses-title">Courses</h2>

        <div className="courses-grid">
          {courses.map(c => (
            <div key={c.id} className="course-card">
              <Link to={`/courses/${c.id}`}>{c.title}</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}