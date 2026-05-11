import { useEffect, useState } from "react";
import styles from "../styles";

function Courses({ token, role, setSelectedCourse }) {

  const [courses, setCourses] = useState([]);

  useEffect(() => {

    fetch("http://127.0.0.1:8000/api/courses/", {

      headers: {
        Authorization: `Token ${token}`,
      },

    })

      .then((res) => res.json())

      .then((data) => {

        // ✅ Prevent crash if backend sends error object
        if (Array.isArray(data)) {

          setCourses(data);

        } else {

          console.log(data);

          setCourses([]);
        }
      });

  }, [token]);

  return (

    <div style={{ maxWidth: "900px", margin: "auto" }}>

      {/* 🔹 HEADER */}
      <h2 style={{ marginBottom: "5px" }}>

        {role
          ? role.toUpperCase() + " Dashboard"
          : "Dashboard"}

      </h2>

      <p
        style={{
          color: "#64748b",
          marginBottom: "20px",
        }}
      >

        {role === "trainer" &&
          "Manage your courses"}

        {role === "student" &&
          "View your enrolled courses"}

        {role === "admin" &&
          "Full system access"}

      </p>

      {/* 📚 COURSE CARDS */}
      {courses.length === 0 ? (

        <p>No courses available</p>

      ) : (

        Array.isArray(courses) && courses.map((course) => (

          <div
            key={course.id}

            style={{
              ...styles.card,
              transition: "0.2s",
            }}

            onMouseEnter={(e) =>
              (e.currentTarget.style.transform =
                "scale(1.02)")
            }

            onMouseLeave={(e) =>
              (e.currentTarget.style.transform =
                "scale(1)")
            }
          >

            <h3
              style={{
                cursor: "pointer",
                color: "#2563eb",
                margin: 0,
              }}

              onClick={() =>
                setSelectedCourse(course.id)
              }
            >
              {course.title}
            </h3>

            {/* 👨‍🏫 TRAINER NAME */}
            {course.trainer && (

              <p
                style={{
                  marginTop: "10px",
                  color: "#64748b",
                }}
              >
                Trainer:
                {" "}
                <strong>{course.trainer}</strong>
              </p>

            )}

          </div>
        ))
      )}

    </div>
  );
}

export default Courses;