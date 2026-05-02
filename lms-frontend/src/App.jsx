import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Layouts
import StudentLayout from "./layouts/StudentLayout";
import AdminLayout   from "./layouts/AdminLayout";
import TrainerLayout from "./layouts/TrainerLayout";

// Pages — Auth
import Login from "./pages/Login";
import Register from "./pages/Register";

// Pages — Student
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProgress  from "./pages/student/StudentProgress";

// Pages — Admin
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers    from "./pages/admin/AdminUsers";
import AdminCourses  from "./pages/admin/AdminCourses";

// Pages — Trainer
import TrainerDashboard from "./pages/trainer/TrainerDashboard";
import TrainerAssign    from "./pages/trainer/TrainerAssign";

const Placeholder = ({ label }) => (
  <div style={{
    minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center",
    color: "#444", fontFamily: "'DM Sans', sans-serif", fontSize: "1rem",
  }}>
    🚧 {label} — coming soon
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* ── Public ─────────────────────────────────────────── */}
          <Route path="/login"        element={<Login />} />
          <Route path="/register"     element={<Register />} />
          <Route path="/unauthorized" element={<Placeholder label="Unauthorized" />} />

          {/* ── Admin ──────────────────────────────────────────── */}
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminOverview />} />
              <Route path="/admin/users"     element={<AdminUsers />}    />
              <Route path="/admin/courses"   element={<AdminCourses />}  />
            </Route>
          </Route>

          {/* ── Trainer ────────────────────────────────────────── */}
          <Route element={<ProtectedRoute roles={["trainer"]} />}>
            <Route element={<TrainerLayout />}>
              <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
              <Route path="/trainer/assign"    element={<TrainerAssign />}    />
            </Route>
          </Route>

          {/* ── Student ────────────────────────────────────────── */}
          <Route element={<ProtectedRoute roles={["student"]} />}>
            <Route element={<StudentLayout />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/progress"  element={<StudentProgress />} />
            </Route>
          </Route>

          {/* ── Fallback ───────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}