import { useEffect, useState } from "react";

import API from "../services/api";

export default function StudentDashboard() {

  const [courses, setCourses] = useState([]);

  const [myCourses, setMyCourses] = useState([]);

  const [videos, setVideos] = useState([]);

  // fetch all courses
  const fetchCourses = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await API.get(
        "/courses",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCourses(response.data.courses);

    } catch (error) {

      console.log(error);
    }
  };

  // fetch enrolled courses
  const fetchMyCourses = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await API.get(
        "/student/my-courses",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMyCourses(response.data.courses);

    } catch (error) {

      console.log(error);
    }
  };

  useEffect(() => {

    fetchCourses();

    fetchMyCourses();

  }, []);

  // enroll course
  const handleEnroll = async (courseId) => {

    try {

      const token = localStorage.getItem("token");

      const response = await API.post(

        "/enrollments",

        {
          course_id: courseId,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);

      fetchMyCourses();

    } catch (error) {

      console.log(error);

      alert("Enrollment failed");
    }
  };

  // fetch videos
  const fetchVideos = async (courseId) => {

    try {

      const token = localStorage.getItem("token");

      const response = await API.get(

        `/videos/${courseId}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setVideos(response.data.videos);

    } catch (error) {

      console.log(error);

      alert("Cannot fetch videos");
    }
  };

  // convert youtube links to embed links
  const convertToEmbed = (url) => {

    try {

      // normal youtube links
      if (url.includes("watch?v=")) {

        const videoId = new URL(url)
          .searchParams
          .get("v");

        return `https://www.youtube.com/embed/${videoId}`;
      }

      // youtu.be links
      if (url.includes("youtu.be/")) {

        const videoId = url.split("youtu.be/")[1];

        return `https://www.youtube.com/embed/${videoId}`;
      }

      return "";

    } catch (error) {

      console.log(error);

      return "";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "Arial",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "250px",
          backgroundColor: "#111827",
          color: "white",
          padding: "30px",
        }}
      >
        <h2 style={{ marginBottom: "40px" }}>
          LMS Portal
        </h2>

        <p style={{ marginBottom: "20px" }}>
          Dashboard
        </p>

        <p style={{ marginBottom: "20px" }}>
          My Courses
        </p>

        <button
          onClick={() => {

            localStorage.clear();

            window.location.href = "/";
          }}
          style={{
            marginTop: "30px",
            padding: "12px 20px",
            backgroundColor: "#6366f1",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* Main */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#0b0146",
          color: "white",
          padding: "40px",
        }}
      >
        {/* Available Courses */}
        <h1 style={{ marginBottom: "30px" }}>
          Available Courses
        </h1>

        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          {courses.map((course) => (

            <div
              key={course.id}
              style={{
                backgroundColor: "#111827",
                padding: "25px",
                borderRadius: "12px",
                width: "250px",
              }}
            >
              <h3>{course.title}</h3>

              <p>{course.description}</p>

              <button
                onClick={() =>
                  handleEnroll(course.id)
                }
                style={{
                  marginTop: "15px",
                  padding: "10px 15px",
                  backgroundColor: "#6366f1",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Enroll
              </button>
            </div>
          ))}
        </div>

        {/* My Courses */}
        <h1
          style={{
            marginTop: "50px",
            marginBottom: "30px",
          }}
        >
          My Courses
        </h1>

        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          {myCourses.map((course) => (

            <div
              key={course.id}
              style={{
                backgroundColor: "#111827",
                padding: "25px",
                borderRadius: "12px",
                width: "250px",
              }}
            >
              <h3>{course.title}</h3>

              <p>{course.description}</p>

              <button
                onClick={() =>
                  fetchVideos(course.id)
                }
                style={{
                  marginTop: "15px",
                  padding: "10px 15px",
                  backgroundColor: "#16a34a",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                View Videos
              </button>
            </div>
          ))}
        </div>

        {/* Videos */}
        {videos.length > 0 && (

          <div style={{ marginTop: "50px" }}>

            <h1 style={{ marginBottom: "30px" }}>
              Course Videos
            </h1>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "30px",
              }}
            >
              {videos.map((video) => (

                <iframe
                  key={video.id}
                  width="700"
                  height="400"
                  src={convertToEmbed(
                    video.youtube_link
                  )}
                  title="YouTube video"
                  frameBorder="0"
                  allowFullScreen
                  style={{
                    borderRadius: "12px",
                  }}
                ></iframe>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}