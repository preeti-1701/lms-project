import { Link, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

async function api(path, options = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

function youtubeIdFromUrl(url = '') {
  if (url.includes('watch?v=')) return url.split('watch?v=')[1]?.split('&')[0] || ''
  if (url.includes('youtu.be/')) return url.split('youtu.be/')[1]?.split('?')[0] || ''
  return ''
}

function LoginPage({ onLogin }) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async () => {
    try {
      setError('')
      await api('/api/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      })
      onLogin()
    } catch (e) {
      setError(e.message)
    }
  }
  return (
    <main className="auth-wrap">
      <section className="auth-card">
        <h1>Welcome Back</h1>
        <p className="muted">Sign in with email/mobile and password</p>
        <div className="field-group">
          <label>Email or Mobile</label>
          <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Enter email or mobile" />
        </div>
        <div className="field-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
        </div>
        {error && <p className="error">{error}</p>}
        <button className="btn-primary" onClick={submit}>Sign In</button>
      </section>
    </main>
  )
}

function DashboardPage({ user }) {
  const [courses, setCourses] = useState([])

  useEffect(() => {
    if (user?.role === 'student') {
      api('/api/dashboard/').then((data) => setCourses(data.courses || []))
    }
  }, [user?.role])

  if (user?.role === 'student') {
    return (
      <section>
        <div className="page-header">
          <div>
            <h2>Dashboard</h2>
            <p className="muted">Your assigned courses</p>
          </div>
          <span className="badge">{user?.role}</span>
        </div>
        <div className="cards-grid">
          {courses.map((course) => (
            <article className="card" key={course.id}>
              {course.first_video_url && (
                <img
                  className="yt-thumb"
                  src={`https://img.youtube.com/vi/${youtubeIdFromUrl(course.first_video_url)}/mqdefault.jpg`}
                  alt={course.title}
                />
              )}
              <h3>{course.title}</h3>
              <Link className="btn-outline" to={`/courses/${course.id}`}>Open Course</Link>
            </article>
          ))}
          {!courses.length && <p className="muted">No assigned courses.</p>}
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p className="muted">Access management modules from one place</p>
        </div>
        <span className="badge">{user?.role}</span>
      </div>
      <div className="module-grid">
        <article className="card">
          <h3>Course Management</h3>
          <p className="muted">Create course and view all courses/videos.</p>
          <Link className="btn-primary" to="/courses">Open</Link>
        </article>
        {user?.role === 'admin' && (
          <article className="card">
            <h3>User Management</h3>
            <p className="muted">Create users and assign roles.</p>
            <Link className="btn-primary" to="/users">Open</Link>
          </article>
        )}
        {user?.role === 'admin' && (
          <article className="card">
            <h3>Session Control</h3>
            <p className="muted">Track active sessions and force logout.</p>
            <Link className="btn-primary" to="/sessions">Open</Link>
          </article>
        )}
      </div>
    </section>
  )
}

function CourseManagementPage({ user }) {
  const [courses, setCourses] = useState([])
  const [form, setForm] = useState({ title: '', description: '', youtube_url: '' })
  const [message, setMessage] = useState('')

  const canCreate = user?.role === 'admin' || user?.role === 'trainer'

  const load = async () => {
    const data = await api('/api/dashboard/')
    setCourses(data.courses || [])
  }

  useEffect(() => { load() }, [])

  const createCourse = async () => {
    try {
      await api('/api/courses/', { method: 'POST', body: JSON.stringify(form) })
      setForm({ title: '', description: '', youtube_url: '' })
      setMessage('Course created.')
      load()
    } catch (e) {
      setMessage(e.message)
    }
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Course Management</h2>
        </div>
      </div>
      {canCreate && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3>Create Course</h3>
          <div className="field-group">
            <label>Title</label>
            <input placeholder="Enter course title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="field-group">
            <label>Description</label>
            <input placeholder="Enter course description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="field-group">
            <label>YouTube Link</label>
            <input placeholder="Paste YouTube link" value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} />
          </div>
          {message && <p className="muted">{message}</p>}
          <button className="btn-primary" onClick={createCourse}>Create Course</button>
        </div>
      )}
      <div className="cards-grid">
        {courses.map((course) => (
          <article className="card" key={course.id}>
            {course.first_video_url && (
              <img
                className="yt-thumb"
                src={`https://img.youtube.com/vi/${youtubeIdFromUrl(course.first_video_url)}/mqdefault.jpg`}
                alt={course.title}
              />
            )}
            <h3>{course.title}</h3>
            <p className="muted">{course.description}</p>
            <Link className="btn-outline" to={`/courses/${course.id}`}>Open Detail</Link>
          </article>
        ))}
      </div>
    </section>
  )
}

function CourseDetailPage({ user }) {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [students, setStudents] = useState([])
  const [videos, setVideos] = useState([])
  const [allStudents, setAllStudents] = useState([])
  const [selectedStudentIds, setSelectedStudentIds] = useState([])
  const [assignMessage, setAssignMessage] = useState('')

  useEffect(() => {
    api(`/api/courses/${id}/`).then((data) => {
      setCourse(data.course)
      setStudents(data.students || [])
      setVideos(data.videos || [])
    })
  }, [id])

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'trainer') {
      api('/api/students/').then((data) => setAllStudents(data.students || []))
    }
  }, [user?.role])

  if (!course) return <p>Loading...</p>

  const assignStudents = async () => {
    try {
      const data = await api(`/api/courses/${id}/enroll/`, {
        method: 'POST',
        body: JSON.stringify({ student_ids: selectedStudentIds.map((value) => Number(value)) }),
      })
      setAssignMessage(`${data.assigned_count} student(s) assigned`)
      const refreshed = await api(`/api/courses/${id}/`)
      setStudents(refreshed.students || [])
    } catch (e) {
      setAssignMessage(e.message)
    }
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>{course.title}</h2>
          <p className="muted">{course.description}</p>
        </div>
        {user?.role === 'admin' && <Link className="btn-primary" to="/users">Assign from Users</Link>}
      </div>
      {user?.role === 'student' ? (
        <div className="card">
          <h3>Description</h3>
          <p>{course.description || 'No description provided.'}</p>
          {videos.length > 0 ? (
            <div style={{ marginTop: '1rem', position: 'relative' }}>
              <h3>Watch on YouTube</h3>
              <button
                className="btn-primary"
                onClick={async () => {
                  const data = await api(`/api/courses/${course.id}/videos/${videos[0].id}/watch-link/`)
                  window.open(data.watch_url, '_blank', 'noreferrer')
                }}
              >
                Open YouTube Link
              </button>
              <div className="video-watermark">
                {user?.username} | {user?.email || 'student'}
              </div>
            </div>
          ) : (
            <p className="muted">No video available for this course.</p>
          )}
        </div>
      ) : (
      <div className="layout-two">
        <div className="card">
          <h3>Videos</h3>
          <ul className="clean-list">
            {videos.map((video) => (
              <li key={video.id}>
                {video.title} - <a className="link" href={video.youtube_url} target="_blank">open</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3>Assigned Students</h3>
          <ul className="clean-list">
            {students.map((student) => <li key={student.id}>{student.username}</li>)}
          </ul>
          {(user?.role === 'admin' || user?.role === 'trainer') && (
            <>
              <h3 style={{ marginTop: '1rem' }}>Assign Students</h3>
              <select
                multiple
                value={selectedStudentIds}
                onChange={(event) =>
                  setSelectedStudentIds(Array.from(event.target.selectedOptions, (option) => option.value))
                }
                style={{ width: '100%', minHeight: '120px', marginBottom: '0.8rem' }}
              >
                {allStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.username}
                  </option>
                ))}
              </select>
              <button className="btn-primary" onClick={assignStudents}>Assign Selected</button>
              {assignMessage && <p className="muted" style={{ marginTop: '0.5rem' }}>{assignMessage}</p>}
            </>
          )}
        </div>
      </div>
      )}
    </section>
  )
}

function UsersPage() {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ username: '', email: '', mobile: '', password: '', role: 'trainer' })
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState(null)

  const load = async () => {
    const data = await api('/api/users/')
    setUsers(data.users || [])
  }
  useEffect(() => { load() }, [])

  const createUser = async () => {
    try {
      await api('/api/users/create/', { method: 'POST', body: JSON.stringify(form) })
      setForm({ username: '', email: '', mobile: '', password: '', role: 'trainer' })
      setMessage('User created')
      load()
    } catch (e) {
      setMessage(e.message)
    }
  }

  const startEdit = (u) => {
    setEditingId(u.id)
    setMessage('')
    setForm({
      username: u.username || '',
      email: u.email || '',
      mobile: u.mobile || '',
      password: '',
      role: u.role || 'student',
      is_active: Boolean(u.is_active),
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm({ username: '', email: '', mobile: '', password: '', role: 'trainer' })
    setMessage('')
  }

  const updateUser = async () => {
    try {
      await api(`/api/users/${editingId}/update/`, { method: 'PUT', body: JSON.stringify(form) })
      setMessage('User updated')
      setEditingId(null)
      setForm({ username: '', email: '', mobile: '', password: '', role: 'trainer' })
      load()
    } catch (e) {
      setMessage(e.message)
    }
  }

  const deleteUser = async (id) => {
    if (!window.confirm('Delete user?')) return
    await api(`/api/users/${id}/`, { method: 'DELETE' })
    load()
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>User Management</h2>
        </div>
      </div>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>{editingId ? 'Edit User' : 'Create User'}</h3>
        <div className="grid-2">
          <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          <input placeholder={editingId ? 'New Password (optional)' : 'Password'} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="admin">Admin</option>
            <option value="trainer">Trainer</option>
            <option value="student">Student</option>
          </select>
          {editingId && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={Boolean(form.is_active)}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Active
            </label>
          )}
        </div>
        {message && <p className="muted">{message}</p>}
        {!editingId ? (
          <button className="btn-primary" onClick={createUser}>Create User</button>
        ) : (
          <div className="actions">
            <button className="btn-primary" onClick={updateUser}>Save Changes</button>
            <button className="btn-outline" onClick={cancelEdit}>Cancel</button>
          </div>
        )}
      </div>
      <div className="table-wrap card">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td><span className={`badge ${user.is_active ? 'success' : 'muted-badge'}`}>{user.is_active ? 'Active' : 'Disabled'}</span></td>
                <td>
                  <button className="btn-outline small" onClick={() => startEdit(user)}>Edit</button>
                  <button className="btn-danger small" onClick={() => deleteUser(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function SessionsPage() {
  const [users, setUsers] = useState([])
  const [activities, setActivities] = useState([])

  const load = async () => {
    const data = await api('/api/sessions/')
    setUsers(data.users || [])
    setActivities(data.activities || [])
  }

  useEffect(() => { load() }, [])

  const forceLogout = async (userId) => {
    await api(`/api/sessions/force-logout/${userId}/`, { method: 'POST' })
    load()
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Session Control</h2>
          <p className="muted">Monitor active sessions and force logout</p>
        </div>
      </div>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Users</h3>
        <table>
          <thead><tr><th>User</th><th>Role</th><th>Active Session</th><th>Action</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.role}</td>
                <td>{u.active_session ? 'Yes' : 'No'}</td>
                <td>{u.active_session && <button className="btn-danger small" onClick={() => forceLogout(u.id)}>Force Logout</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <h3>Recent Activity</h3>
        <table>
          <thead><tr><th>User</th><th>IP</th><th>Device Info</th><th>Status</th></tr></thead>
          <tbody>
            {activities.map((a) => (
              <tr key={a.id}>
                <td>{a.username}</td>
                <td>{a.ip_address || 'N/A'}</td>
                <td title={a.user_agent || 'N/A'}>{a.user_agent || 'N/A'}</td>
                <td>{a.is_active ? 'Active' : 'Logged out'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function AppShell({ user, onLogout }) {
  const location = useLocation()
  const nav = user?.role === 'student'
    ? [{ path: '/dashboard', label: 'Dashboard' }]
    : user?.role === 'trainer'
      ? [
          { path: '/dashboard', label: 'Dashboard' },
          { path: '/courses', label: 'Course Management' },
        ]
      : [
          { path: '/dashboard', label: 'Dashboard' },
          { path: '/courses', label: 'Course Management' },
          { path: '/users', label: 'User Management' },
          { path: '/sessions', label: 'Session Control' },
        ]

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1 className="logo">LMS</h1>
        {nav.map((item) => (
          <Link key={item.path} to={item.path} className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}>
            {item.label}
          </Link>
        ))}
      </aside>
      <div className="main-content">
        <header className="topbar">
          <p>{user?.username} · {user?.role}</p>
          <button className="btn-outline" onClick={onLogout}>Logout</button>
        </header>
        <div className="content">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage user={user} />} />
            <Route path="/courses" element={<CourseManagementPage user={user} />} />
            <Route path="/courses/:id" element={<CourseDetailPage user={user} />} />
            <Route path="/users" element={user?.role === 'admin' ? <UsersPage /> : <Navigate to="/dashboard" replace />} />
            <Route path="/sessions" element={user?.role === 'admin' ? <SessionsPage /> : <Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const isAuthed = useMemo(() => Boolean(user), [user])

  const refreshMe = async () => {
    try {
      const me = await api('/api/me/')
      setUser(me)
    } catch {
      setUser(null)
    }
  }

  useEffect(() => {
    refreshMe()
  }, [])

  const logoutUser = async () => {
    await api('/api/auth/logout/', { method: 'POST' })
    setUser(null)
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthed ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={refreshMe} />} />
      <Route path="/*" element={isAuthed ? <AppShell user={user} onLogout={logoutUser} /> : <Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
