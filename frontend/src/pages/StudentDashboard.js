import {
  useEffect,
  useState
} from "react";

import {
  Link
} from "react-router-dom";

import api from "../api";

import "./StudentDashboard.css";

export default function StudentDashboard() {

  const [courses,
    setCourses] = useState([]);

  const [page,
    setPage] = useState(
      "dashboard"
    );

  const studentId =
  localStorage.getItem(
    "user_id"
  );

  useEffect(() => {

    api.get(

      `courses/student/?student=${studentId}`

    )

    .then((res) => {

      setCourses(
        res.data
      );
    });

  }, []);

  return (

    <div className="student-layout">

      {/* SIDEBAR */}

      <div className="sidebar">

        <h2>
          LMS
        </h2>

        <button
          onClick={() =>
            setPage(
              "dashboard"
            )
          }
        >

          Dashboard

        </button>

        <button
          onClick={() =>
            setPage(
              "courses"
            )
          }
        >

          Courses

        </button>

      </div>

      

      {/* MAIN */}

      <div className="main-content">

       <div className="topbar">

  <h1>
    Student Dashboard
  </h1>

  <div className="user-info">

    <div>

      <h3>
        👤 {
          localStorage.getItem(
            "username"
          )
        }
      </h3>

      <p>
        (student)
      </p>

    </div>

    <button

      onClick={() => {

        localStorage.clear();

        window.location.href = "/";
      }}
    >

      Logout

    </button>

  </div>

</div>

        {/* DASHBOARD */}

        {page === "dashboard" && (

          <div className="dashboard-box">

            <h2>
              Welcome Student 👋
            </h2>

            <p>

              This Learning Management
              System helps students
              securely access assigned
              courses and watch learning
              videos uploaded by trainers
              and admins.

            </p>

            <div className="stats">

              <div className="stat-card">

                <h3>
                  {courses.length}
                </h3>

                <p>
                  Assigned Courses
                </p>

              </div>

            </div>

          </div>
        )}

        {/* COURSES */}

        {page === "courses" && (

          <div className="courses-grid">

            {courses.map((course) => (

              <div
                key={course.id}
                className="course-card"
              >

                <h2>
                  {course.title}
                </h2>

                <p>
                  {course.description}
                </p>

                {course.videos.map(
                  (video, i) => (

                  <div
                    key={i}
                    className="video-box"
                  >

                    <h4>
                      {video.title}
                    </h4>

                    <a
                      href={video.video}
                      target="_blank"
                      rel="noreferrer"
                    >

                      Watch Video

                    </a>

                  </div>

                ))}

              </div>

            ))}

          </div>
        )}

      </div>

    </div>
  );
}