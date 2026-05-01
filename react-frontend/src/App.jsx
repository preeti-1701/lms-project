import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { getStoredUser, clearAuth } from './api/client'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import CourseDetail from './pages/CourseDetail'
import Lesson from './pages/Lesson'
import Quiz from './pages/Quiz'

function Nav({ user, onLogout }) {
  return (
    <nav className="nav">
      <Link to="/dashboard" className="nav-brand">
        <span className="nav-brand-mark"></span>
        LearnNova
      </Link>
      <div className="nav-right">
        {user && (
          <>
            <span>{user.first_name || user.username}</span>
            <div className="nav-chip" style={{ background: user.avatar_color }}>
              {user.initials}
            </div>
            <a onClick={onLogout} style={{ cursor: 'pointer' }}>Sign out</a>
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

export default function App() {
  const [user, setUser] = useState(getStoredUser())
  const navigate = useNavigate()

  const handleLogin = (u) => {
    setUser(u)
    navigate('/dashboard')
  }

  const handleLogout = () => {
    clearAuth()
    setUser(null)
    navigate('/')
  }

  return (
    <>
      {user && <Nav user={user} onLogout={handleLogout} />}
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup onLogin={handleLogin} />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth user={user}>
              <Dashboard user={user} />
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
      </Routes>
    </>
  )
}
