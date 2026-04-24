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

    const disableRightClick = (e) => e.preventDefault();
    document.addEventListener("contextmenu", disableRightClick);

    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
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