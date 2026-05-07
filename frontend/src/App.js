import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Login from "./pages/Login";

import AdminDashboard
from "./pages/AdminDashboard";

import TrainerDashboard
from "./pages/TrainerDashboard";

import StudentDashboard
from "./pages/StudentDashboard";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        {/* ADMIN */}

        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />

        {/* TRAINER */}

        <Route
          path="/trainer-dashboard"
          element={<TrainerDashboard />}
        />

        {/* STUDENT */}

        <Route
          path="/student-dashboard"
          element={<StudentDashboard />}
        />

        {/* SIDEBAR ROUTES */}

        <Route
          path="/dashboard"
          element={<StudentDashboard />}
        />

        <Route
          path="/courses"
          element={<StudentDashboard />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;