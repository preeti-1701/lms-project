import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import LandingPage        from './pages/LandingPage';
import LoginPage          from './pages/auth/LoginPage';
import RegisterPage       from './pages/auth/RegisterPage';

import AdminDashboard     from './pages/admin/AdminDashboard';
import AdminUsers         from './pages/admin/AdminUsers';
import CoursesPage        from './pages/admin/CoursesPage';
import AdminStudents      from './pages/admin/AdminStudents';

import TrainerDashboard   from './pages/trainer/TrainerDashboard';

import StudentDashboard   from './pages/student/StudentDashboard';
import StudentCourses     from './pages/student/StudentCourses';
import StudentCourseView  from './pages/student/StudentCourseView';
import BrowseCourses      from './pages/student/BrowseCourses';

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  const map = { admin: '/admin/dashboard', trainer: '/trainer/dashboard', student: '/student/dashboard' };
  return <Navigate to={map[user.role] || '/'} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#ffffff', color: '#1e2a45', border: '1px solid #dde3f0', fontSize: 14, boxShadow: '0 4px 16px rgba(79,70,229,.12)' },
        }} />
        <Routes>
          {/* Public */}
          <Route path="/"                element={<LandingPage />} />
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/dashboard"       element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
            <Route index                 element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard"     element={<AdminDashboard />} />
            <Route path="users"         element={<AdminUsers />} />
            <Route path="courses"       element={<CoursesPage isAdmin={true} />} />
            <Route path="students"      element={<AdminStudents />} />
          </Route>

          {/* Trainer */}
          <Route path="/trainer" element={<ProtectedRoute roles={['trainer']}><Layout /></ProtectedRoute>}>
            <Route index                 element={<Navigate to="/trainer/dashboard" replace />} />
            <Route path="dashboard"     element={<TrainerDashboard />} />
            <Route path="courses"       element={<CoursesPage isAdmin={false} />} />
            <Route path="students"      element={<AdminStudents />} />
          </Route>

          {/* Student */}
          <Route path="/student" element={<ProtectedRoute roles={['student']}><Layout /></ProtectedRoute>}>
            <Route index                 element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard"     element={<StudentDashboard />} />
            <Route path="courses"       element={<StudentCourses />} />
            <Route path="course/:id"    element={<StudentCourseView />} />
            <Route path="browse"        element={<BrowseCourses />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
