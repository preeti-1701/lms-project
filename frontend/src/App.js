import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import CoursesPage from './pages/admin/CoursesPage';
import CourseDetailPage from './pages/admin/CourseDetailPage';
import { SessionsPage, AuditLogsPage } from './pages/admin/SessionsPage';
import TrainerCoursesPage from './pages/trainer/TrainerCoursesPage';
import TrainerCourseDetailPage from './pages/trainer/TrainerCourseDetailPage';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCoursePage from './pages/student/StudentCoursePage';
import VideoPlayerPage from './pages/student/VideoPlayerPage';
import NotFoundPage from './pages/NotFoundPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontSize:'1rem',color:'#6b7280'}}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'trainer') return <Navigate to="/trainer" replace />;
  return <Navigate to="/student" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RoleRedirect />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute>} />
          <Route path="/admin/courses" element={<ProtectedRoute roles={['admin']}><CoursesPage /></ProtectedRoute>} />
          <Route path="/admin/courses/:id" element={<ProtectedRoute roles={['admin']}><CourseDetailPage /></ProtectedRoute>} />
          <Route path="/admin/sessions" element={<ProtectedRoute roles={['admin']}><SessionsPage /></ProtectedRoute>} />
          <Route path="/admin/audit-logs" element={<ProtectedRoute roles={['admin']}><AuditLogsPage /></ProtectedRoute>} />

          {/* Trainer Routes */}
          <Route path="/trainer" element={<ProtectedRoute roles={['trainer']}><TrainerCoursesPage /></ProtectedRoute>} />
          <Route path="/trainer/courses/:id" element={<ProtectedRoute roles={['trainer']}><TrainerCourseDetailPage /></ProtectedRoute>} />

          {/* Student Routes */}
          <Route path="/student" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/courses/:id" element={<ProtectedRoute roles={['student']}><StudentCoursePage /></ProtectedRoute>} />
          <Route path="/student/courses/:courseId/videos/:videoId" element={<ProtectedRoute roles={['student']}><VideoPlayerPage /></ProtectedRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
