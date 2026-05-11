import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [isRegister, setIsRegister] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loggedIn, setLoggedIn] = useState(false);

  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");

  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");

  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [courseId, setCourseId] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setLoggedIn(true);
      fetchCourses();
    }
  }, []);

  const register = async () => {
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/register/",
        {
          username,
          password,
        }
      );

      alert("Registration Successful ✅");

      setIsRegister(false);
    } catch (error) {
      alert("Registration Failed ❌");
      console.log(error);
    }
  };

  const login = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/login/",
        {
          username,
          password,
        }
      );

      localStorage.setItem("token", response.data.access);

      alert("Login Successful ✅");

      setLoggedIn(true);

      fetchCourses();
    } catch (error) {
      alert("Login Failed ❌");
      console.log(error);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://127.0.0.1:8000/api/courses/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCourses(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const addCourse = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://127.0.0.1:8000/api/courses/",
        {
          title: courseTitle,
          description: courseDescription,
          created_by: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Course Added ✅");

      setCourseTitle("");
      setCourseDescription("");

      fetchCourses();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteCourse = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://127.0.0.1:8000/api/courses/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Course Deleted ✅");

      fetchCourses();
    } catch (error) {
      console.log(error);
    }
  };

  const addVideo = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://127.0.0.1:8000/api/videos/",
        {
          title: videoTitle,
          youtube_url: videoUrl,
          course: courseId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Video Added ✅");

      setVideoTitle("");
      setVideoUrl("");
      setCourseId("");

      fetchCourses();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteVideo = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://127.0.0.1:8000/api/videos/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Video Deleted ✅");

      fetchCourses();
    } catch (error) {
      console.log(error);
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalVideos = courses.reduce(
    (total, course) => total + course.videos.length,
    0
  );

  return (
    <div className="container">
      {!loggedIn ? (
        <div className="login-box">
          <h1>{isRegister ? "Register" : "Login"}</h1>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {isRegister ? (
            <button onClick={register}>Register</button>
          ) : (
            <button onClick={login}>Login</button>
          )}

          <br />
          <br />

          <button onClick={() => setIsRegister(!isRegister)}>
            {isRegister
              ? "Already have account? Login"
              : "Create New Account"}
          </button>
        </div>
      ) : (
        <div>
          <h1>📚 LMS Dashboard</h1>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              setLoggedIn(false);
            }}
          >
            Logout
          </button>

          <hr />

          <div
            style={{
              display: "flex",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <div className="course-card">
              <h2>Total Courses</h2>
              <h1>{courses.length}</h1>
            </div>

            <div className="course-card">
              <h2>Total Videos</h2>
              <h1>{totalVideos}</h1>
            </div>
          </div>

          <h2>Search Courses</h2>

          <input
            type="text"
            placeholder="Search by course title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <hr />

          <h2>Add Course</h2>

          <input
            type="text"
            placeholder="Course Title"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
          />

          <textarea
            placeholder="Course Description"
            value={courseDescription}
            onChange={(e) => setCourseDescription(e.target.value)}
          />

          <button onClick={addCourse}>Add Course</button>

          <hr />

          <h2>Add Video</h2>

          <input
            type="text"
            placeholder="Video Title"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
          />

          <input
            type="text"
            placeholder="YouTube URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />

          <input
            type="number"
            placeholder="Course ID"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          />

          <button onClick={addVideo}>Add Video</button>

          <hr />

          {filteredCourses.map((course) => (
            <div className="course-card" key={course.id}>
              <h2>{course.title}</h2>

              <button onClick={() => deleteCourse(course.id)}>
                Delete Course
              </button>

              <p>{course.description}</p>

              {course.videos.map((video) => (
                <div key={video.id}>
                  <h3>{video.title}</h3>

                  <button onClick={() => deleteVideo(video.id)}>
                    Delete Video
                  </button>

                  <br />
                  <br />

                  <iframe
                    width="560"
                    height="315"
                    src={`https://www.youtube.com/embed/${
                      video.youtube_url.split("v=")[1]?.split("&")[0]
                    }`}
                    title={video.title}
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;