import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function MyCourses() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          sessionStorage.getItem("token");

        const res = await axios.get(
          "http://127.0.0.1:8000/api/my-courses/",
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        console.log("My Courses:", res.data);

        setCourses(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchMyCourses();
  }, []);

  return (
    <div style={{ padding: "40px", background: "#0f172a", minHeight: "100vh", color: "white" }}>
      
      <h1 style={{ marginBottom: "30px" }}>📚 My Learning</h1>

      {courses.length === 0 ? (
        <p>No enrolled courses yet</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {courses.map((course) => (
            <div
              key={course.id}
              style={{
                background: "#1e293b",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
              }}
            >
              <h3>{course.title}</h3>
              <p style={{ fontSize: "14px", opacity: 0.7 }}>
                {course.description}
              </p>

              {/* 🔥 Progress Bar */}
              <div style={{
                height: "8px",
                background: "#334155",
                borderRadius: "10px",
                marginTop: "10px"
              }}>
                <div style={{
                  width: `${course.progress || 0}%`,
                  height: "100%",
                  background: "#22c55e",
                  borderRadius: "10px"
                }} />
              </div>

              <p style={{ fontSize: "12px", marginTop: "5px" }}>
                {course.progress || 0}% completed
              </p>

              <button
                onClick={() => navigate(`/course/${course.id}`)}
                style={{
                  marginTop: "15px",
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Continue Learning →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyCourses;