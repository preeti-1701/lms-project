import './App.css';
import React, { useState, useEffect } from 'react';
import CreateUser from './CreateUser';
import Login from './Login';
import CreateCourse from './CreateCourse';
import AddVideo from './AddVideo';
import StudentDashboard from './StudentDashboard';
import EnrollStudent from './EnrollStudent';

function App() {
  const [page, setPage] = useState('login');
  const [user, setUser] = useState(null);

  // 🔹 Load user + disable right click
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }

    // 🔹 Disable right click
    const disableRightClick = (e) => e.preventDefault();
    document.addEventListener("contextmenu", disableRightClick);

    // 🔹 Block common shortcuts
    const blockShortcuts = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (
          e.key.toLowerCase() === 'c' || // copy
          e.key.toLowerCase() === 's' || // save
          e.key.toLowerCase() === 'u' || // view source
          e.key.toLowerCase() === 'p' || // print
          e.key.toLowerCase() === 'a'    // select all
        )
      ) {
        e.preventDefault();
        alert("Action restricted");
      }

      // F12 Dev tools
      if (e.key === "F12") {
        e.preventDefault();
        alert("Developer tools disabled");
      }

    };
    document.addEventListener("keydown", blockShortcuts);

    let inactivityTimer;
    const logoutUser = () => {
      alert("Session expired due to inactivity");
      localStorage.clear();
      setUser(null);
      setPage('login');
      window.location.href = "/";
    };

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(
        logoutUser,
        30 * 60 * 1000   // 30 minutes
      );
    };

    const detectPrintScreen = (e) => {
      if (e.key === "PrintScreen") {
        alert(
          "Screenshots are restricted on this LMS"
        );
        // optional: clear clipboard attempt
        navigator.clipboard.writeText('');
      }
    };



    // user activity events
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keypress", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);
    document.addEventListener("keydown", detectPrintScreen);

    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("keydown", blockShortcuts);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keypress", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      document.removeEventListener("keydown", detectPrintScreen);
    };

  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setPage('login');
  };

  return (
    <div style={{ padding: "20px" }}>

      {/* 🔹 Navigation */}
      <div style={{ marginBottom: "20px" }}>

        <button onClick={() => setPage('login')}>Login</button>

        {/* ✅ ADMIN ONLY */}
        {user?.role === 'admin' && (
          <>
            <button onClick={() => setPage('create')}>Create User</button>
            <button onClick={() => setPage('course')}>Create Course</button>
            <button onClick={() => setPage('video')}>Add Video</button>
            <button onClick={() => setPage('enroll')}>Enroll Student</button>
          </>
        )}

        {/* ✅ TRAINER */}
        {user?.role === 'trainer' && (
          <>
            <button onClick={() => setPage('course')}>Create Course</button>
            <button onClick={() => setPage('video')}>Add Video</button>
          </>
        )}

        {/* ✅ STUDENT */}
        {user?.role === 'student' && (
          <button onClick={() => setPage('student')}>Student Dashboard</button>
        )}

        {/* ✅ LOGOUT */}
        {user && (
          <button
            onClick={handleLogout}
            style={{
              marginLeft: "10px",
              backgroundColor: "red",
              color: "white"
            }}
          >
            Logout
          </button>
        )}

      </div>

      {/* 🔹 Pages */}
      {page === 'login' && <Login setUser={setUser} />}
      {page === 'create' && <CreateUser />}
      {page === 'course' && <CreateCourse />}
      {page === 'video' && <AddVideo />}
      {page === 'student' && <StudentDashboard />}
      {page === 'enroll' && <EnrollStudent />}

    </div>
  );
}

export default App;