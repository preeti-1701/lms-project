import React, { useEffect, useState } from 'react';
import api from './api';

function StudentDashboard() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/api/student-courses/');
        console.log("API RESPONSE:", response.data); // 🔍 Debug
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  // 🔥 Convert YouTube link → embed format
  const getEmbedUrl = (url) => {
    if (!url) return "";

    if (url.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${url.split("/").pop()}`;
    }

    if (url.includes("watch?v=")) {
      return `https://www.youtube.com/embed/${url.split("v=")[1].split("&")[0]}`;
    }

    return url;
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2 style={{ marginBottom: "20px" }}>My Courses</h2>

      {/* 🔹 Empty State */}
      {courses.length === 0 && (
        <p>No courses assigned or no videos available</p>
      )}

      {/* 🔹 Courses */}
      {courses && courses.map((c, index) => (
        <div key={index} style={{
          marginBottom: "40px",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          backgroundColor: "#f9f9f9"
        }}>
          <h3 style={{ marginBottom: "15px" }}>{c.course}</h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
            
            {/* 🔹 Videos */}
            {c.videos && c.videos.length > 0 ? (
              c.videos.map((v, i) => (
                <div key={i} style={{
                  width: "420px",
                  border: "1px solid #ccc",
                  borderRadius: "10px",
                  padding: "10px",
                  backgroundColor: "white",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                }}>
                  <h4>{v.title}</h4>

                  <p style={{ color: "gray", fontSize: "14px" }}>
                    {v.description || "No description available"}
                  </p>

                  <iframe
                    width="100%"
                    height="230"
                    src={getEmbedUrl(v.link)}   // ✅ Correct key
                    title={v.title}
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
              ))
            ) : (
              <p>No videos available</p>
            )}

          </div>
        </div>
      ))}
    </div>
  );
}

export default StudentDashboard;