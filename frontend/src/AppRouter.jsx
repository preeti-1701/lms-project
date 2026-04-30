import { lazy, Suspense, useContext, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppContext } from "./context/AppContext";

const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const SignupPage = lazy(() => import("./pages/SignupPage.jsx"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard.jsx"));
const TrainerDashboard = lazy(() => import("./pages/TrainerDashboard.jsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));

function Loader() {
  return <div style={{ padding: 16 }}>Loading...</div>;
}

function RequireAuth({ children }) {
  const ctx = useContext(AppContext);
  if (!ctx.auth.user) return <Navigate to="/" replace />;
  return children;
}

export default function AppRouter() {
  const ctx = useContext(AppContext);

  useEffect(() => {
    // If user has tokens stored but missing user info, refresh /me
    if (!ctx.auth.user && ctx.auth.access) {
      ctx.actions.refreshMe().catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/sudentDashboard"
            element={
              <RequireAuth>
                <StudentDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/trainerDashboard"
            element={
              <RequireAuth>
                <TrainerDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/adminDashboard"
            element={
              <RequireAuth>
                <AdminDashboard />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
