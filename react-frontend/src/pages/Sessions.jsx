import { useEffect, useState } from 'react'
import { api } from '../api/client'

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`
  return `${Math.floor(seconds / 86400)} days ago`
}

export default function Sessions({ user }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.mySessions()
      .then(data => {
        setSessions(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="loading">Loading session history</div>
  if (error) return <div className="container"><p>Error: {error}</p></div>

  const active = sessions.filter(s => s.is_active)
  const past = sessions.filter(s => !s.is_active)

  return (
    <div className="dash-wrap">
      <div className="dash-hero-strip">
        <div>
          <div className="kicker">
            <span className="kicker-dot"></span>
            Account Security
          </div>
          <h1 className="display dash-greeting">
            Your <em>sessions.</em>
          </h1>
          <p className="dash-subtitle">
            For your security, only one device can be signed in at a time.
            When you sign in somewhere new, your previous sessions are automatically signed out.
          </p>
        </div>
      </div>

      <div className="dash-section">
        <div className="section-head">
          <h2 className="section-title">Active <em>now</em></h2>
          <div className="section-count">{active.length} session{active.length !== 1 ? 's' : ''}</div>
        </div>

        {active.length === 0 ? (
          <div className="empty-state-big">
            <p>No active sessions.</p>
          </div>
        ) : (
          <div className="sessions-list">
            {active.map(s => (
              <div key={s.id} className={`session-card ${s.is_current ? 'current' : ''}`}>
                <div className="session-icon">
                  {s.device_label.includes('iPhone') || s.device_label.includes('Android') ? '📱' : '💻'}
                </div>
                <div className="session-info">
                  <div className="session-title">
                    {s.device_label}
                    {s.is_current && <span className="current-pill">This device</span>}
                  </div>
                  <div className="session-meta">
                    <span>IP: {s.ip_address || 'unknown'}</span>
                    <span>·</span>
                    <span>Active {timeAgo(s.last_active)}</span>
                  </div>
                </div>
                <div className="session-status">
                  <span className="status-dot active"></span>
                  Active
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div className="dash-section">
          <div className="section-head">
            <h2 className="section-title">Recent <em>history</em></h2>
            <div className="section-count">{past.length} past session{past.length !== 1 ? 's' : ''}</div>
          </div>

          <div className="sessions-list">
            {past.map(s => (
              <div key={s.id} className="session-card past">
                <div className="session-icon" style={{ opacity: 0.5 }}>
                  {s.device_label.includes('iPhone') || s.device_label.includes('Android') ? '📱' : '💻'}
                </div>
                <div className="session-info">
                  <div className="session-title">{s.device_label}</div>
                  <div className="session-meta">
                    <span>IP: {s.ip_address || 'unknown'}</span>
                    <span>·</span>
                    <span>Signed out {timeAgo(s.last_active)}</span>
                  </div>
                </div>
                <div className="session-status past">
                  <span className="status-dot"></span>
                  Ended
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="security-note">
        <strong>🔒 Notice something unfamiliar?</strong>
        <p>
          If you see a session from a device you don't recognize, it means someone may have access to your account.
          Sign out, change your password immediately, and contact your administrator.
        </p>
      </div>
    </div>
  )
}
