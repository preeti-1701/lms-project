import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Navbar from './components/Navbar'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import TrainerDashboard from './pages/TrainerDashboard'
import StudentDashboard from './pages/StudentDashboard'
import CourseDetail from './pages/CourseDetail'
import ManageUsers from './pages/ManageUsers'
import SecureVideoPage from './pages/SecureVideoPage'

function App() {
  const { user, loading } = useAuth()
  const location = useLocation()

  // detect secure video route
  const isSecureVideoPage = location.pathname.startsWith('/secure-video/')

  // 🔥 SAFE LOADING UI (prevents blank screen)
  if (loading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "18px"
      }}>
        Loading LMS...
      </div>
    )
  }

  // 🔥 SAFE ROLE ROUTING
  const getDashboardByRole = () => {
    if (!user) return '/login'

    switch (user.role) {
      case 'admin':
        return '/admin'
      case 'trainer':
        return '/trainer'
      case 'student':
        return '/student'
      default:
        return '/login'
    }
  }

  if (isSecureVideoPage) {
    return (
      <Routes>
        <Route
          path="/secure-video/:token"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <SecureVideoPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    )
  }

  return (
    <div className="app">
      {user && <Navbar />}

      <main className="main-content">
        <Routes>

          {/* LOGIN */}
          <Route
            path="/login"
            element={
              user
                ? <Navigate to={getDashboardByRole()} replace />
                : <Login />
            }
          />

          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />

          {/* TRAINER */}
          <Route
            path="/trainer"
            element={
              <ProtectedRoute allowedRoles={['trainer']}>
                <TrainerDashboard />
              </ProtectedRoute>
            }
          />

          {/* STUDENT */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* COURSE DETAIL */}
          <Route
            path="/course/:id"
            element={
              <ProtectedRoute allowedRoles={['admin', 'trainer', 'student']}>
                <CourseDetail />
              </ProtectedRoute>
            }
          />

          {/* ROOT REDIRECT (SAFE) */}
          <Route
            path="/"
            element={<Navigate to={getDashboardByRole()} replace />}
          />

          {/* FALLBACK */}
          <Route
            path="*"
            element={<Navigate to={getDashboardByRole()} replace />}
          />

        </Routes>
      </main>
    </div>
  )
}

export default App
