import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const getUserRole = () => localStorage.getItem('role');

function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer"
          element={
            <ProtectedRoute role="trainer">
              <TrainerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={getUserRole() ? `/${getUserRole()}` : '/login'} replace />} />
      </Routes>
    </div>
  );
}

export default App;
