import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, setToken, setStoredUser } from '../api/client'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api.login(email.trim(), password)
      setToken(res.token)
      setStoredUser(res.user)
      onLogin(res.user)
    } catch (err) {
      // If account exists but needs verification, redirect to OTP flow
      if (err.data?.needs_verification) {
        navigate('/signup', { state: { email: err.data.email, needsVerification: true } })
        return
      }
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div>
          <div className="kicker" style={{ color: 'var(--accent-soft)', marginBottom: '1rem' }}>
            <span className="kicker-dot" style={{ background: 'var(--accent)' }}></span>
            Coursify
          </div>
          <h2>
            Learn things <em>you</em> actually want to know.
          </h2>
        </div>
        <p>
          Your personalized learning platform. Enroll in courses,
          track your progress, and earn completion certificates.
        </p>
      </div>

      <div className="login-right">
        <h1>Welcome back</h1>
        <p className="sub">Sign in to continue</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="you@example.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--ink-softer)' }}>
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>

        <div className="demo-accounts">
          <strong>Demo accounts</strong> (all passwords: <code>demo1234</code>)<br />
          Student: <code>student@demo.com</code><br />
          Instructor: <code>priya_sharma</code>
        </div>
      </div>
    </div>
  )
}
