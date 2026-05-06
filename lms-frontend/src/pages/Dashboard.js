import { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

function Dashboard() {

  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  const navigate = useNavigate();


  useEffect(() => {
    fetchCourses();
  }, []);


  const fetchCourses = async () => {

    try {

      const res = await axios.get("my-courses/");

      setCourses(res.data);

    } catch (err) {

      console.log(err);
    }
  };


  const logout = () => {

    localStorage.clear();
    sessionStorage.clear();

    navigate("/");
  };


  const continueLearning = async (courseId) => {

    try {

      navigate(`/course/${courseId}`);

    } catch (err) {

      console.log(err);
    }
  };


  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase()
      .includes(search.toLowerCase())
  );


  return (

    <div
      style={{
        display: "flex",
        minHeight: "100vh",

        background: darkMode
          ? "linear-gradient(135deg,#0f172a,#1e3a8a,#312e81)"
          : "#f5f5f5",

        color: darkMode ? "white" : "#111827",

        padding: "20px",
        transition: "0.3s",
      }}
    >

      {/* SIDEBAR */}
      <div
        className="glass"
        style={{
          width: "230px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >

        <div>

          <h2 style={{ marginBottom: "30px" }}>
            LMS
          </h2>

          <p
            style={{
              marginBottom: "10px",
              cursor: "pointer",
            }}
          >
            🏠 Dashboard
          </p>

          <p
            style={{
              marginBottom: "10px",
              cursor: "pointer",
            }}
          >
            📚 My Courses
          </p>

          <p
            style={{
              marginBottom: "10px",
              cursor: "pointer",
            }}
          >
            📝 Notes
          </p>

          <p
            style={{
              marginBottom: "10px",
              cursor: "pointer",
            }}
          >
            🧠 Quiz
          </p>

          <p
            style={{
              cursor: "pointer",
            }}
          >
            ⚙ Settings
          </p>

        </div>

        {/* Logout */}
        <button
          onClick={logout}
          style={{
            border: "1px solid #ef4444",
            background: "transparent",
            color: "#ef4444",
            padding: "10px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>

      </div>

      {/* MAIN */}
      <div
        style={{
          flex: 1,
          padding: "0 40px",
        }}
      >

        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "30px",
            alignItems: "center",
          }}
        >

          <h2>
            Welcome back, Student 👋
          </h2>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >

            {/* SEARCH */}
            <input
              placeholder="Search courses..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              style={{
                padding: "10px",
                borderRadius: "10px",
                border: "none",
                outline: "none",
                width: "220px",
              }}
            />

            {/* DARK MODE */}
            <button
              onClick={() =>
                setDarkMode(!darkMode)
              }
              style={{
                padding: "8px 15px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                background: "#6366f1",
                color: "white",
              }}
            >
              {darkMode ? "☀ Light" : "🌙 Dark"}
            </button>

            {/* SECURE BADGE */}
            <div
              style={{
                fontSize: "11px",
                padding: "4px 10px",
                borderRadius: "12px",
                background:
                  "rgba(34,197,94,0.15)",
                border:
                  "1px solid rgba(34,197,94,0.3)",
                backdropFilter: "blur(8px)",
                color: "#22c55e",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              🔒 Secure
            </div>

          </div>

        </div>

        {/* STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(180px,1fr))",
            gap: "18px",
            marginBottom: "30px",
          }}
        >

          <div className="glass" style={{ padding: "20px" }}>
            <h3>{courses.length}</h3>
            <p>Total Courses</p>
          </div>

          <div className="glass" style={{ padding: "20px" }}>
            <h3>
              {
                courses.filter(
                  (c) => c.progress === 100
                ).length
              }
            </h3>
            <p>Completed</p>
          </div>

          <div className="glass" style={{ padding: "20px" }}>
            <h3>
              {
                courses.filter(
                  (c) =>
                    c.progress > 0 &&
                    c.progress < 100
                ).length
              }
            </h3>
            <p>In Progress</p>
          </div>

        </div>

        {/* COURSE GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill,minmax(260px,1fr))",
            gap: "22px",
          }}
        >

          {filteredCourses.map((course) => (

            <div
              key={course.id}
              className="glass"
              style={{
                padding: "20px",
                position: "relative",
                transition: "0.3s",
              }}

              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  "translateY(-6px)";
              }}

              onMouseLeave={(e) => {
                e.currentTarget.style.transform =
                  "translateY(0)";
              }}
            >

              {/* ICON */}
              <div
                style={{
                  position: "absolute",
                  top: "15px",
                  right: "15px",
                }}
              >

                <img
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"
                  alt="icon"
                  style={{
                    width: "28px",
                    height: "28px",
                    opacity: 0.9,
                  }}
                />

              </div>

              {/* CONTENT */}
              <div style={{ padding: "5px" }}>

                {/* TITLE */}
                <h3
                  style={{
                    marginBottom: "6px",
                  }}
                >
                  {course.title}
                </h3>

                {/* DESCRIPTION */}
                <p
                  style={{
                    fontSize: "14px",
                    opacity: 0.8,
                    marginBottom: "18px",
                  }}
                >
                  {course.description}
                </p>

                {/* PROGRESS */}
                <div
                  style={{
                    height: "5px",
                    background: "#1e293b",
                    borderRadius: "10px",
                  }}
                >

                  <div
                    style={{
                      width: `${course.progress}%`,
                      height: "100%",
                      background: "#22c55e",
                      borderRadius: "10px",
                    }}
                  />

                </div>

                {/* PROGRESS TEXT */}
                <p
                  style={{
                    fontSize: "13px",
                    marginTop: "10px",
                    opacity: 0.8,
                  }}
                >
                  {course.progress}% Completed
                </p>

                {/* COMPLETE BADGE */}
                {course.progress === 100 && (

                  <div
                    style={{
                      marginTop: "10px",
                      fontSize: "12px",
                      color: "#22c55e",
                    }}
                  >
                    ✅ Course Completed
                  </div>
                )}

                {/* BUTTONS */}
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "15px",
                  }}
                >

                  {/* CONTINUE */}
                  <button
                    onClick={() =>
                      continueLearning(course.id)
                    }
                    style={{
                      flex: 1,
                      padding: "9px",
                      borderRadius: "10px",
                      border: "none",
                      background: "#6366f1",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    Continue →
                  </button>

                  {/* CERTIFICATE */}
                  {course.progress === 100 && (

                    <button
                      onClick={() =>
                        window.open(
                          `http://127.0.0.1:8000/api/certificate/${course.id}/`,
                          "_blank"
                        )
                      }
                      style={{
                        padding: "9px",
                        borderRadius: "10px",
                        border: "none",
                        background: "#22c55e",
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      🏆
                    </button>
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

export default Dashboard;