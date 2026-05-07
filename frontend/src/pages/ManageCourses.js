import {
  useEffect,
  useState
} from "react";

import api from "../api";

import Sidebar from "../components/Sidebar";

import Topbar from "../components/Topbar";

import "./Dashboard.css";

export default function ManageCourses() {

  const [courses, setCourses] = useState([]);

  const [title, setTitle] = useState("");

  const [description, setDescription] =
    useState("");

  const [courseId, setCourseId] =
    useState("");

  const [videoTitle, setVideoTitle] =
    useState("");

  const [videoUrl, setVideoUrl] =
    useState("");

  useEffect(() => {

    loadCourses();

  }, []);

  const loadCourses = () => {

    api.get("courses/all/")

      .then((res) => {

        setCourses(res.data);

      })

      .catch((err) => {

        console.log(err);

      });
  };

  const createCourse = () => {

    api.post("courses/create/", {

      title,

      description

    })

    .then(() => {

      alert("Course Created");

      loadCourses();

    })

    .catch((err) => {

      console.log(err);

    });
  };

  const addVideo = () => {

    api.post("courses/add-video/", {

      course: courseId,

      title: videoTitle,

      video_url: videoUrl

    })

    .then(() => {

      alert("YouTube Video Added");

    })

    .catch((err) => {

      console.log(err);

    });
  };

  return (

    <div className="layout">

      <Sidebar />

      <div className="main">

        <Topbar />

        <div className="content">

          <h1>
            Manage Courses
          </h1>

          <input
            type="text"
            placeholder="Course Title"
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />

          <textarea
            placeholder="Description"
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />

          <button onClick={createCourse}>
            Create Course
          </button>

          <hr />

          <input
            type="number"
            placeholder="Course ID"
            onChange={(e) =>
              setCourseId(e.target.value)
            }
          />

          <input
            type="text"
            placeholder="Video Title"
            onChange={(e) =>
              setVideoTitle(e.target.value)
            }
          />

          <input
            type="text"
            placeholder="YouTube Link"
            onChange={(e) =>
              setVideoUrl(e.target.value)
            }
          />

          <button onClick={addVideo}>
            Add YouTube Video
          </button>

          <hr />

          <div className="card-grid">

            {courses.map((course) => (

              <div
                className="card"
                key={course.id}
              >

                <h3>
                  {course.title}
                </h3>

                <p>
                  {course.description}
                </p>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}