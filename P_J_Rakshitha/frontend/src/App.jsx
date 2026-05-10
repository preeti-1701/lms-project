import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import StudentDashboard from './pages/student/StudentDashboard'
import TrainerDashboard from './pages/trainer/TrainerDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/student" element={
          <ProtectedRoute roles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />

        <Route path="/trainer" element={
          <ProtectedRoute roles={['trainer']}>
            <TrainerDashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/unauthorized" element={
          <div className="flex items-center justify-center h-screen">
            <h1 className="text-2xl font-bold text-red-500">Unauthorized Access</h1>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App