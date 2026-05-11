import { lazy, Suspense, useContext, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppContext } from "./context/AppContext";
import AdminDashboard, {
  AdminEnrollmentsPage,
  AdminEnrollmentsByCoursePage,
  AdminEnrollmentsByStudentPage,
  AdminPendingCourseDetailPage,
  AdminPendingCoursesPage,
  AdminPendingTrainersPage,
  AdminUserDetailModal,
  AdminUsersPage,
} from "./pages/AdminDashboard.jsx";
import StudentDashboard, { StudentCourseDetailPage, StudentCoursesPage, StudentMyCoursesPage } from "./pages/StudentDashboard.jsx";
import TrainerDashboard, {
  TrainerCourseDetailPage,
  TrainerCourseFormPage,
  TrainerCoursesPage,
} from "./pages/TrainerDashboard.jsx";

const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const SignupPage = lazy(() => import("./pages/SignupPage.jsx"));

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
    // Always refresh /me when we have a token so role/approved stays current
    // (localStorage may contain stale user data from the last login).
    if (ctx.auth.access) ctx.actions.refreshMe().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.auth.access]);

  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/sudentDashboard" element={<Navigate to="/studentDashboard" replace />} />
          <Route
            path="/studentDashboard"
            element={
              <RequireAuth>
                <StudentDashboard />
              </RequireAuth>
            }>
            <Route index element={<StudentCoursesPage />} />
            <Route path="my-courses" element={<StudentMyCoursesPage />} />
            <Route path="courses/:courseId" element={<StudentCourseDetailPage />} />
          </Route>
          <Route
            path="/trainerDashboard"
            element={
              <RequireAuth>
                <TrainerDashboard />
              </RequireAuth>
            }>
            <Route index element={<TrainerCoursesPage />} />
            <Route path="add-course" element={<TrainerCourseFormPage />} />
            <Route path="courses/:courseId" element={<TrainerCourseDetailPage />} />
            <Route path="courses/:courseId/edit" element={<TrainerCourseFormPage />} />
          </Route>
          <Route
            path="/adminDashboard"
            element={
              <RequireAuth>
                <AdminDashboard />
              </RequireAuth>
            }>
            <Route index element={<Navigate to="pending-courses" replace />} />
            <Route path="pending-courses" element={<AdminPendingCoursesPage />}>
              <Route path=":courseId" element={<AdminPendingCourseDetailPage />} />
            </Route>
            <Route path="pending-trainers" element={<AdminPendingTrainersPage />} />
            <Route path="enrollments" element={<AdminEnrollmentsPage />}>
              <Route index element={<Navigate to="courses" replace />} />
              <Route path="courses" element={<AdminEnrollmentsByCoursePage />} />
              <Route path="students" element={<AdminEnrollmentsByStudentPage />} />
            </Route>
            <Route path="users/:role" element={<AdminUsersPage />}>
              <Route path=":userId" element={<AdminUserDetailModal />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
