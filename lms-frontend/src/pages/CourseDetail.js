import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../utils/axiosInstance";

function CourseDetail() {

  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCourse();
  }, []);

  const fetchCourse = async () => {

    try {

      const res = await axios.get(`course/${id}/`);

      setCourse(res.data.course);
      setVideos(res.data.videos);

      if (res.data.videos.length > 0) {
        setCurrentVideo(res.data.videos[0]);
      }

    } catch (err) {
      console.log(err);
    }
  };

  const markComplete = async (videoId) => {

    try {

      await axios.post(
        "mark-complete/",
        {
          video_id: videoId,
        }
      );

      const updatedVideos = videos.map((video) => {

        if (video.id === videoId) {
          return {
            ...video,
            completed: true,
          };
        }

        return video;
      });

      setVideos(updatedVideos);

    } catch (err) {

      console.log(err);
    }
  };

  const openVideo = (video) => {

    setCurrentVideo(video);

    window.open(video.youtube_link, "_blank");
  };

  return (

    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#0f172a,#1e3a8a,#312e81)",
        color: "white",
        padding: "30px",
      }}
    >

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >

        <div>

          <h1>{course?.title}</h1>

          <p style={{ opacity: 0.8 }}>
            {course?.description}
          </p>

        </div>

        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "10px 18px",
            borderRadius: "10px",
            border: "none",
            background: "#6366f1",
            color: "white",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>

      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 350px",
          gap: "25px",
        }}
      >

        {/* CURRENT VIDEO */}
        <div
          className="glass"
          style={{
            padding: "25px",
            borderRadius: "20px",
          }}
        >

          <h2 style={{ marginBottom: "20px" }}>
            Current Lesson
          </h2>

          {currentVideo ? (

            <div>

              <h3>{currentVideo.title}</h3>

              <p
                style={{
                  opacity: 0.8,
                  marginTop: "10px",
                  marginBottom: "20px",
                }}
              >
                Click below to open lesson
              </p>

              <button
                onClick={() => openVideo(currentVideo)}
                style={{
                  padding: "12px 20px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#22c55e",
                  color: "white",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
              >
                ▶ Watch Video
              </button>

              {!currentVideo.completed && (

                <button
                  onClick={() =>
                    markComplete(currentVideo.id)
                  }
                  style={{
                    padding: "12px 20px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#6366f1",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  ✅ Mark Complete
                </button>

              )}

            </div>

          ) : (

            <p>No videos available</p>

          )}

        </div>

        {/* VIDEO LIST */}
        <div
          className="glass"
          style={{
            padding: "20px",
            borderRadius: "20px",
          }}
        >

          <h2 style={{ marginBottom: "20px" }}>
            Course Content
          </h2>

          {videos.map((video, index) => (

            <div
              key={video.id}
              onClick={() => setCurrentVideo(video)}
              style={{
                padding: "15px",
                marginBottom: "12px",
                borderRadius: "12px",

                background:
                  currentVideo?.id === video.id
                    ? "rgba(99,102,241,0.25)"
                    : "rgba(255,255,255,0.05)",

                cursor: "pointer",
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >

                <div>

                  <h4>{video.title}</h4>

                  <p
                    style={{
                      fontSize: "13px",
                      opacity: 0.7,
                    }}
                  >
                    Lesson {index + 1}
                  </p>

                </div>

                <div>

                  {video.completed ? (
                    <span style={{ color: "#22c55e" }}>
                      ✅
                    </span>
                  ) : (
                    <span>▶</span>
                  )}

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default CourseDetail;