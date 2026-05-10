import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { getStoredUser, clearAuth } from './api/client'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Catalog from './pages/Catalog'
import CourseDetail from './pages/CourseDetail'
import Lesson from './pages/Lesson'
import Quiz from './pages/Quiz'
import Sessions from './pages/Sessions'
import InstructorDashboard from './pages/InstructorDashboard'
import InstructorCourseEditor from './pages/InstructorCourseEditor'

function Nav({ user, onLogout }) {
  const isInstructor = user?.role === 'instructor'
  const homePath = isInstructor ? '/instructor' : '/dashboard'
  return (
    <nav className="nav">
      <Link to={homePath} className="nav-brand">
        <span className="nav-brand-mark"></span>
        Coursify
      </Link>
      <div className="nav-right">
        {user && (
          <>
            {isInstructor ? (
              <>
                <Link to="/instructor" className="nav-link">Console</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/catalog" className="nav-link">Catalog</Link>
              </>
            )}
            <Link to="/sessions" className="nav-link" title="Active sessions">🔒</Link>
            <span className="nav-separator"></span>
            <span>{user.first_name || user.username}</span>
            {isInstructor && <span className="role-badge">Instructor</span>}
            <div className="nav-chip" style={{ background: user.avatar_color }}>
              {user.initials}
            </div>
            <a onClick={onLogout} style={{ cursor: 'pointer' }}>Log out</a>
          </>
        )}
      </div>
    </nav>
  )
}

function RequireAuth({ user, children }) {
  if (!user) return <Navigate to="/login" replace />
  return children
}

function RequireInstructor({ user, children }) {
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'instructor') return <Navigate to="/dashboard" replace />
  return children
}

function RoleHome({ user }) {
  if (!user) return <Landing />
  if (user.role === 'instructor') return <Navigate to="/instructor" replace />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  const [user, setUser] = useState(getStoredUser())
  const [logoutToast, setLogoutToast] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null)
      setLogoutToast('You were logged out because your account was used on another device.')
      navigate('/login')
      setTimeout(() => setLogoutToast(null), 6000)
    }
    window.addEventListener('coursify:force-logout', handleForceLogout)
    return () => window.removeEventListener('coursify:force-logout', handleForceLogout)
  }, [navigate])

  const handleLogin = (u) => {
    setUser(u)
    if (u.role === 'instructor') {
      navigate('/instructor')
    } else {
      navigate('/dashboard')
    }
  }

  const handleLogout = async () => {
    try {
      await import('./api/client').then(m => m.api.logout())
    } catch {}
    clearAuth()
    setUser(null)
    navigate('/')
  }

  const homePath = user?.role === 'instructor' ? '/instructor' : '/dashboard'

  return (
    <>
      {user && <Nav user={user} onLogout={handleLogout} />}
      {logoutToast && (
        <div className="logout-toast">
          ⚠️ {logoutToast}
        </div>
      )}
      <Routes>
        <Route path="/" element={<RoleHome user={user} />} />
        <Route path="/login" element={user ? <Navigate to={homePath} replace /> : <Login onLogin={handleLogin} />} />
        <Route path="/signup" element={user ? <Navigate to={homePath} replace /> : <Signup onLogin={handleLogin} />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth user={user}>
              {user?.role === 'instructor' ? <Navigate to="/instructor" replace /> : <Dashboard user={user} />}
            </RequireAuth>
          }
        />
        <Route
          path="/catalog"
          element={
            <RequireAuth user={user}>
              <Catalog user={user} />
            </RequireAuth>
          }
        />
        <Route
          path="/sessions"
          element={
            <RequireAuth user={user}>
              <Sessions user={user} />
            </RequireAuth>
          }
        />
        <Route
          path="/courses/:slug"
          element={
            <RequireAuth user={user}>
              <CourseDetail user={user} />
            </RequireAuth>
          }
        />
        <Route
          path="/courses/:slug/lessons/:lessonId"
          element={
            <RequireAuth user={user}>
              <Lesson user={user} />
            </RequireAuth>
          }
        />
        <Route
          path="/quiz/:quizId"
          element={
            <RequireAuth user={user}>
              <Quiz user={user} />
            </RequireAuth>
          }
        />
        {/* Instructor routes */}
        <Route
          path="/instructor"
          element={
            <RequireInstructor user={user}>
              <InstructorDashboard user={user} />
            </RequireInstructor>
          }
        />
        <Route
          path="/instructor/courses/:slug"
          element={
            <RequireInstructor user={user}>
              <InstructorCourseEditor user={user} mode="edit" />
            </RequireInstructor>
          }
        />
      </Routes>
    </>
  )
}
