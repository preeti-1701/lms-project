import { useState } from "react";

import Login from "./components/Login";
import Courses from "./components/Courses";
import Videos from "./components/Videos";
import Profile from "./components/Profile";
import AdminPanel from "./components/AdminPanel";
import TrainerPanel from "./components/TrainerPanel";
import SecurityMonitor from "./components/SecurityMonitor";

import styles from "./styles";

function App() {

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [role, setRole] = useState(
    localStorage.getItem("role")
  );

  const [selectedCourse, setSelectedCourse] = useState(null);

  const [viewProfile, setViewProfile] = useState(false);

  const [viewAdmin, setViewAdmin] = useState(false);

  // 🔒 LOGOUT
  const handleLogout = () => {

    localStorage.clear();

    setToken(null);

    setRole(null);

    setSelectedCourse(null);

    setViewProfile(false);

    setViewAdmin(false);
  };

  // 🔐 LOGIN PAGE
  if (!token) {

    return (
      <Login
        setToken={setToken}
        setRole={setRole}
      />
    );
  }

  return (

    <div style={styles.app}>

      {/* 🔐 SECURITY MONITOR */}
      <SecurityMonitor />

      {/* 🔹 NAVBAR */}
      <nav style={styles.nav}>

        <h2 style={styles.navTitle}>
          LMS Portal
        </h2>

        <div>

          <span
            style={{
              marginRight: "14px",
              fontWeight: "600",
            }}
          >
            {role?.toUpperCase()}
          </span>

          <button
            style={styles.logoutBtn}
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </nav>

      {/* 🔹 MAIN LAYOUT */}
      <div style={styles.container}>

        {/* 🔹 SIDEBAR */}
        <div style={styles.sidebar}>

          {/* 📚 COURSES */}
          <p
            style={styles.sidebarItem}

            onClick={() => {

              setViewAdmin(false);

              setViewProfile(false);

              setSelectedCourse(null);
            }}
          >
            Courses
          </p>

          {/* 👤 PROFILE */}
          <p
            style={styles.sidebarItem}

            onClick={() => {

              setViewAdmin(false);

              setViewProfile(true);

              setSelectedCourse(null);
            }}
          >
            Profile
          </p>

          {/* 👑 ADMIN PANEL ONLY FOR ADMIN */}
          {role === "admin" && (

            <p
              style={styles.sidebarItem}

              onClick={() => {

                setViewAdmin(true);

                setViewProfile(false);

                setSelectedCourse(null);
              }}
            >
              Admin Panel
            </p>

          )}

        </div>

        {/* 🔹 CONTENT */}
        <div style={styles.content}>

          {/* 👑 ADMIN */}
          {viewAdmin && role === "admin" ? (

            <AdminPanel token={token} />

          ) : viewProfile ? (

            /* 👤 PROFILE */
            <Profile token={token} />

          ) : selectedCourse ? (

            /* 🎥 VIDEOS */
            <Videos
              token={token}
              courseId={selectedCourse}
              setSelectedCourse={setSelectedCourse}
            />

          ) : role === "trainer" ? (

            /* 👨‍🏫 TRAINER */
            <TrainerPanel token={token} />

          ) : (

            /* 🎓 STUDENT / ADMIN COURSES */
            <Courses
              token={token}
              role={role}
              setSelectedCourse={setSelectedCourse}
            />

          )}

        </div>

      </div>

    </div>
  );
}

export default App;