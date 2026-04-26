import './App.css';
import React, { useEffect, useState } from 'react';

import {
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

// Pages
import AdminDashboard from './AdminDashboard';
import TrainerDashboard from './TrainerDashboard';
import Home from './pages/Home';
import Login from './Login';
import CreateUser from './CreateUser';
import CreateCourse from './CreateCourse';
import AddVideo from './AddVideo';
import EnrollStudent from './EnrollStudent';
import StudentDashboard from './StudentDashboard';


function App() {

  // =============================
  // User Session State
  // =============================
  const [user, setUser] = useState(
    JSON.parse(
      localStorage.getItem('user')
    )
  );


  // =============================
  // Security Controls
  // =============================
  useEffect(() => {

    // Disable Right Click
    const disableRightClick = (e) => {
      e.preventDefault();
    };


    // Block shortcuts
    const blockShortcuts = (e) => {

      if (
        (e.ctrlKey || e.metaKey) &&
        (
          e.key.toLowerCase() === 'c' ||
          e.key.toLowerCase() === 's' ||
          e.key.toLowerCase() === 'u' ||
          e.key.toLowerCase() === 'p' ||
          e.key.toLowerCase() === 'a'
        )
      ) {
        e.preventDefault();
        alert("Action restricted");
      }


      // Block F12
      if (e.key === "F12") {
        e.preventDefault();
        alert("Developer tools disabled");
      }

    };


    // Detect Print Screen
    const detectPrintScreen = (e) => {

      if (
        e.key === "PrintScreen" ||

        (
          e.metaKey &&
          e.shiftKey &&
          (
            e.key === "3" ||
            e.key === "4" ||
            e.key === "5"
          )
        )
      ) {

        e.preventDefault();

        alert(
          "Screen capture restricted"
        );

      }

    };


    // =============================
    // Auto Logout for Inactivity
    // =============================
    let inactivityTimer;

    const logoutUser = () => {

      alert(
        "Session expired due to inactivity"
      );

      localStorage.clear();
      setUser(null);

      window.location.href = "/";

    };


    const resetTimer = () => {

      clearTimeout(
        inactivityTimer
      );

      inactivityTimer = setTimeout(
        logoutUser,
        30 * 60 * 1000
      );

    };


    // =============================
    // Event Listeners
    // =============================
    document.addEventListener(
      "contextmenu",
      disableRightClick
    );

    document.addEventListener(
      "keydown",
      blockShortcuts
    );

    document.addEventListener(
      "keydown",
      detectPrintScreen
    );

    window.addEventListener(
      "mousemove",
      resetTimer
    );

    window.addEventListener(
      "keypress",
      resetTimer
    );

    window.addEventListener(
      "click",
      resetTimer
    );

    window.addEventListener(
      "scroll",
      resetTimer
    );


    resetTimer();


    // Cleanup
    return () => {

      clearTimeout(
        inactivityTimer
      );

      document.removeEventListener(
        "contextmenu",
        disableRightClick
      );

      document.removeEventListener(
        "keydown",
        blockShortcuts
      );

      document.removeEventListener(
        "keydown",
        detectPrintScreen
      );

      window.removeEventListener(
        "mousemove",
        resetTimer
      );

      window.removeEventListener(
        "keypress",
        resetTimer
      );

      window.removeEventListener(
        "click",
        resetTimer
      );

      window.removeEventListener(
        "scroll",
        resetTimer
      );

    };

  }, []);



  // =============================
  // Logout Function
  // =============================
  const handleLogout = () => {

    localStorage.clear();

    setUser(null);

    window.location.href = "/";

  };



  // =============================
  // Protected Route
  // =============================
  const ProtectedRoute = ({
    children,
    role
  }) => {

    if (!user) {
      return <Navigate to="/login" />;
    }

    if (
      role &&
      user.role !== role
    ) {
      return <Navigate to="/" />;
    }

    return children;

  };


  // =============================
  // Routes
  // =============================
  return (


    <Routes>

      {/* Admin Route */}
      <Route
        path='/admin'
        element={
          <ProtectedRoute role='admin'>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Trainer Route */}
      <Route
        path='/trainer'
        element={
          <ProtectedRoute role='trainer'>
            <TrainerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Public Routes */}
      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={
          <Login
            setUser={setUser}
          />
        }
      />


      {/* Admin Routes */}
      <Route
        path="/create-user"
        element={
          <ProtectedRoute role="admin">
            <CreateUser />
          </ProtectedRoute>
        }
      />

      <Route
        path="/enroll"
        element={
          <ProtectedRoute role="admin">
            <EnrollStudent />
          </ProtectedRoute>
        }
      />


      {/* Admin + Trainer */}
      <Route
        path="/create-course"
        element={
          (
            user?.role === "admin" ||
            user?.role === "trainer"
          )
            ? <CreateCourse />
            : <Navigate to="/" />
        }
      />

      <Route
        path="/add-video"
        element={
          (
            user?.role === "admin" ||
            user?.role === "trainer"
          )
            ? <AddVideo />
            : <Navigate to="/" />
        }
      />


      {/* Student */}
      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />


      {/* Logout */}
      <Route
        path="/logout"
        element={
          <button onClick={handleLogout}>
            Logout
          </button>
        }
      />

    </Routes>
  );

}

export default App;