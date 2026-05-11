import { useEffect, useState } from "react";
import styles from "../styles";

function Videos({ token, courseId, setSelectedCourse }) {

  const [videos, setVideos] = useState([]);

  // 🔒 USERNAME FOR WATERMARK
  const username = localStorage.getItem("username");

  useEffect(() => {

    fetch(`http://127.0.0.1:8000/api/courses/${courseId}/videos/`, {

      headers: {
        Authorization: `Token ${token}`,
      },

    })

      .then((res) => res.json())

      .then((data) => setVideos(data));

  }, [courseId, token]);

  return (

    <div style={{ maxWidth: "900px", margin: "auto" }}>

      {/* 🔒 WATERMARK */}
      <div style={styles.watermark}>

        <p>
          {username} | LMS Secure Access
        </p>

        <p>
          {new Date().toLocaleString()}
        </p>

      </div>

      {/* 🔹 HEADER */}
      <div style={{ marginBottom: "20px" }}>

        <h2 style={{ marginBottom: "5px" }}>
          Course Videos
        </h2>

        <p style={{ color: "#64748b" }}>
          Watch your course content
        </p>

      </div>

      {/* 🔙 BACK BUTTON */}
      <button
        style={{
          ...styles.button,
          marginBottom: "20px",
          background: "#64748b",
        }}

        onClick={() => setSelectedCourse(null)}
      >
        ⬅ Back to Courses
      </button>

      {/* 🎥 VIDEO LIST */}
      {videos.length === 0 ? (

        <p>No videos available</p>

      ) : (

        videos.map((video) => (

          <div
            key={video.id}

            style={{
              ...styles.videoCard,
              transition: "0.2s",
            }}

            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.02)")
            }

            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          >

            <p
              style={{
                marginBottom: "10px",
                fontWeight: "600",
                fontSize: "16px",
              }}
            >
              {video.title}
            </p>

            <button
              style={styles.button}

              onClick={() =>

                window.open(
                  `http://127.0.0.1:8000/api/videos/${video.id}/play/?token=${token}`,
                  "_blank"
                )
              }
            >
              ▶ Watch
            </button>

          </div>
        ))
      )}

    </div>
  );
}

export default Videos;