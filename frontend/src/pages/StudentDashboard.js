import { useEffect, useState } from "react";
import api from "../api";
import "./StudentDashboard.css";

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get("/courses/all/")
      .then(res => setCourses(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="dashboard">
      <h1>📚 LMS Dashboard</h1>

      <div className="section-title">My Courses</div>

      <div className="course-grid">
        {courses.map(course => (
          <div className="course-card" key={course.id}>
            <div className="course-title">{course.title}</div>

            <button className="course-btn">
              View Course
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}