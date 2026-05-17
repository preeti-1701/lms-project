import { useEffect, useState } from "react";

import API from "../services/api";

export default function TrainerDashboard() {

  // course creation
  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  // video section
  const [courses, setCourses] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState("");

  const [youtubeLink, setYoutubeLink] = useState("");

  // fetch trainer courses
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

  useEffect(() => {

    fetchCourses();

  }, []);

  // create course
  const handleCreateCourse = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await API.post(

        "/courses",

        {
          title,
          description,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);

      setTitle("");

      setDescription("");

      fetchCourses();

    } catch (error) {

      console.log(error);

      alert("Course creation failed");
    }
  };

  // add video
  const handleAddVideo = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await API.post(

        "/videos",

        {
          course_id: selectedCourse,
          youtube_link: youtubeLink,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);

      setYoutubeLink("");

    } catch (error) {

      console.log(error);

      alert("Video upload failed");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#0b0146",
        minHeight: "100vh",
        color: "white",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ marginBottom: "30px" }}>
        Trainer Dashboard
      </h1>

      {/* Create Course */}
      <div
        style={{
          backgroundColor: "#111827",
          padding: "30px",
          borderRadius: "15px",
          width: "400px",
          marginBottom: "40px",
        }}
      >
        <h2>Create Course</h2>

        <input
          type="text"
          placeholder="Course Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "20px",
            marginBottom: "20px",
            borderRadius: "8px",
            border: "none",
          }}
        />

        <textarea
          placeholder="Course Description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "8px",
            border: "none",
            height: "100px",
          }}
        />

        <button
          onClick={handleCreateCourse}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#6366f1",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          Create Course
        </button>
      </div>

      {/* Add Videos */}
      <div
        style={{
          backgroundColor: "#111827",
          padding: "30px",
          borderRadius: "15px",
          width: "400px",
        }}
      >
        <h2>Add YouTube Video</h2>

        <select
          value={selectedCourse}
          onChange={(e) =>
            setSelectedCourse(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "20px",
            marginBottom: "20px",
            borderRadius: "8px",
            border: "none",
          }}
        >
          <option value="">
            Select Course
          </option>

          {courses.map((course) => (

            <option
              key={course.id}
              value={course.id}
            >
              {course.title}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Paste YouTube Link"
          value={youtubeLink}
          onChange={(e) =>
            setYoutubeLink(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "8px",
            border: "none",
          }}
        />

        <button
          onClick={handleAddVideo}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#16a34a",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          Add Video
        </button>

        <button
          onClick={() => {

            localStorage.clear();

            window.location.href = "/";
          }}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "18px",
            cursor: "pointer",
            marginTop: "20px",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}