import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/useApp';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import VideoPlayer from './pages/VideoPlayer';
import Toast from './components/dashboard/Toast';
import './index.css';

function ProtectedRoute({ children, role }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/" replace />;
  if (role && currentUser.role !== role) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { currentUser } = useApp();

  const getDashRoute = () => {
    if (!currentUser) return '/';
    if (currentUser.role === 'student') return '/student';
    if (currentUser.role === 'trainer') return '/trainer';
    if (currentUser.role === 'admin') return '/admin';
    return '/';
  };

  return (
    <>
      <Toast />
      <Routes>
        <Route path="/" element={currentUser ? <Navigate to={getDashRoute()} replace /> : <AuthPage />} />
        <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/trainer" element={<ProtectedRoute role="trainer"><TrainerDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/video/:courseId/:videoIndex" element={<ProtectedRoute><VideoPlayer /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
console.log('App.jsx loaded');
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
