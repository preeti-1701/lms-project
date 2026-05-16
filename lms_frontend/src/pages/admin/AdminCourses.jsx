import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../utils/api";

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAssign, setShowAssign] = useState(null); // stores courseId
  const [selectedStudent, setSelectedStudent] = useState("");

  useEffect(() => {
    fetchCourses();
    fetchStudents();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await API.get("/courses/");
      setCourses(response.data.courses || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await API.get("/admin/students/");
      setStudents(response.data.students || []);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const deleteCourse = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await API.post(`/courses/admin/${id}/delete/`);
        setCourses(courses.filter((c) => c.id !== id));
        alert("Course deleted successfully");
      } catch (err) {
        setError("Failed to delete course");
        console.error("Error deleting course:", err);
      }
    }
  };

  const handleAssign = async () => {
    if (!selectedStudent) {
      alert("Please select a student");
      return;
    }
    try {
      await API.post("/courses/admin/assign/", {
        user_id: selectedStudent,
        course_id: showAssign
      });
      alert("Course assigned successfully");
      setShowAssign(null);
      setSelectedStudent("");
    } catch (err) {
      alert("Failed to assign course: " + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2>All Courses</h2>

      {showAssign && (
        <div style={{ backgroundColor: "#f0f7ff", padding: "20px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #007bff" }}>
          <h3>Assign Course to Student</h3>
          <p>Course ID: {showAssign}</p>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <select 
              value={selectedStudent} 
              onChange={(e) => setSelectedStudent(e.target.value)}
              style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", minWidth: "200px" }}
            >
              <option value="">Select a Student</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
              ))}
            </select>
            <button onClick={handleAssign} style={{ backgroundColor: "#007bff", color: "white", border: "none", padding: "8px 20px", borderRadius: "4px", cursor: "pointer" }}>Assign</button>
            <button onClick={() => setShowAssign(null)} style={{ backgroundColor: "#6c757d", color: "white", border: "none", padding: "8px 20px", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      {courses.length === 0 ? (
        <p>No courses found.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {courses.map((course) => (
            <div key={course.id} style={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
              <div style={{ width: "100%", height: "180px" }}>
                {course.image_url ? (
                  <img
                    src={course.image_url}
                    alt={course.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
                    No Image
                  </div>
                )}
              </div>
              <div style={{ padding: "15px" }}>
                <h4 style={{ margin: "0 0 8px 0" }}>{course.title}</h4>
                <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#666" }}>{course.description}</p>
                <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "#888" }}>
                  Status: <strong>{course.status || "ongoing"}</strong>
                </p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <Link
                    to={`/admin/dashboard/course/${course.id}`}
                    style={{ padding: "5px 10px", backgroundColor: "#007bff", color: "white", textDecoration: "none", borderRadius: "4px", fontSize: "13px" }}
                  >
                    View
                  </Link>
                  <Link
                    to={`/admin/dashboard/course/${course.id}/edit`}
                    style={{ padding: "5px 10px", backgroundColor: "#ffc107", color: "black", textDecoration: "none", borderRadius: "4px", fontSize: "13px" }}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => setShowAssign(course.id)}
                    style={{ padding: "5px 10px", backgroundColor: "#6f42c1", color: "white", border: "none", borderRadius: "4px", fontSize: "13px", cursor: "pointer" }}
                  >
                    Assign
                  </button>
                  <button
                    onClick={() => deleteCourse(course.id)}
                    style={{ padding: "5px 10px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", fontSize: "13px", cursor: "pointer" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
