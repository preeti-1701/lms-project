import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../utils/api";

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      console.log("Fetching courses from /courses/");
      const response = await API.get("/courses/");
      console.log("Courses response:", response.data);
      setCourses(response.data.courses);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await API.post(`/admin/courses/${id}/delete/`);
        setCourses(courses.filter((c) => c.id !== id));
      } catch (err) {
        setError("Failed to delete course");
        console.error("Error deleting course:", err);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2>All Courses</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {courses.map((course) => (
          <div key={course.id} style={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            <div style={{ width: "100%", height: "200px" }}>
              {course.image_url ? (
                <img
                  src={course.image_url}
                  alt={course.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  No Image
                </div>
              )}
            </div>
            <div style={{ padding: "15px" }}>
              <h4 style={{ margin: "0 0 10px 0" }}>{course.title}</h4>
              <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#666" }}>{course.description}</p>
              <p style={{ margin: "0 0 15px 0", fontSize: "12px" }}>Created by: {course.created_by || 'Admin'}</p>

              <div style={{ display: "flex", gap: "10px" }}>
                <Link to={`/admin/course/${course.id}`} style={{ padding: "5px 10px", backgroundColor: "#007bff", color: "white", textDecoration: "none", borderRadius: "4px", fontSize: "14px" }}>View</Link>
                <Link to={`/admin/course/${course.id}/edit`} style={{ padding: "5px 10px", backgroundColor: "#ffc107", color: "black", textDecoration: "none", borderRadius: "4px", fontSize: "14px" }}>Edit</Link>
                <button onClick={() => deleteCourse(course.id)} style={{ padding: "5px 10px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", fontSize: "14px", cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCourses;
