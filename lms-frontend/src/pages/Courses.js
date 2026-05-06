import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [courseId, setCourseId] = useState("");
  const [videoLink, setVideoLink] = useState("");

  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://127.0.0.1:8000/api/courses/",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      setCourses(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCourses();

    const admin = localStorage.getItem("isAdmin");
    if (admin === "true") {
      setIsAdmin(true);
    }
  }, []);

  const enroll = async (courseId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://127.0.0.1:8000/api/enroll/",
        { course_id: courseId },
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      alert(res.data.message);
    } catch (err) {
      console.log(err);
    }
  };

  const viewCourse = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const addCourse = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://127.0.0.1:8000/api/courses/add/",
        { title, description },
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      alert("Course added");
      fetchCourses();
    } catch (err) {
      console.log(err);
    }
  };

  const addVideo = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://127.0.0.1:8000/api/videos/add/",
        {
          course_id: courseId,
          youtube_link: videoLink,
        },
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      alert("Video added");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={{ background: "#f7f9fa", minHeight: "100vh" }}>
      
      {/* NAVBAR */}
      <div style={{
        background: "#1c1d1f",
        color: "white",
        padding: "15px",
        display: "flex",
        justifyContent: "space-between"
      }}>
        <h2>LMS</h2>

        <div>
          <button onClick={() => navigate("/my-courses")}>
            My Courses
          </button>

          <button
            style={{ marginLeft: "10px" }}
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ padding: "30px" }}>
        <h2>Courses</h2>

        {/* ADMIN */}
        {isAdmin && (
          <div style={{ marginBottom: "20px" }}>
            <input
              placeholder="Title"
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              placeholder="Description"
              onChange={(e) => setDescription(e.target.value)}
            />
            <button onClick={addCourse}>Add Course</button>

            <br /><br />

            <input
              placeholder="Course ID"
              onChange={(e) => setCourseId(e.target.value)}
            />
            <input
              placeholder="Video Link"
              onChange={(e) => setVideoLink(e.target.value)}
            />
            <button onClick={addVideo}>Add Video</button>
          </div>
        )}

        {/* COURSES */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {courses.map((course) => (
            <div key={course.id} style={{
              background: "#fff",
              padding: "15px",
              borderRadius: "10px",
              width: "250px"
            }}>
              <h3>{course.title}</h3>
              <p>{course.description}</p>

              <button onClick={() => enroll(course.id)}>
                Enroll
              </button>

              <button onClick={() => viewCourse(course.id)}>
                View
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Courses;