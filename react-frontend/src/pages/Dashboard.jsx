import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, setStoredUser } from '../api/client'

export default function Dashboard({ user }) {
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.me()
      .then(data => {
        setMe(data)
        setStoredUser(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="loading">Loading your dashboard</div>
  if (error) return <div className="container"><p>Error: {error}</p></div>

  const enrollments = me.enrollments || []
  const inProgress = enrollments.filter(e => !e.completed && e.progress_percent > 0)
  const notStarted = enrollments.filter(e => !e.completed && e.progress_percent === 0)
  const completedCourses = enrollments.filter(e => e.completed)
  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress_percent, 0) / enrollments.length)
    : 0

  // Find the "continue" course — highest progress that isn't complete
  const continueCourse = [...inProgress].sort((a, b) => b.progress_percent - a.progress_percent)[0]

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="dash-wrap">
      {/* ======= HERO STRIP ======= */}
      <div className="dash-hero-strip">
        <div className="dash-hero-inner">
          <div>
            <div className="kicker">
              <span className="kicker-dot"></span>
              {today}
            </div>
            <h1 className="display dash-greeting">
              Welcome back, <em>{me.first_name || me.username}.</em>
            </h1>
            <p className="dash-subtitle">
              {enrollments.length === 0
                ? 'Start your learning journey by exploring our course catalog.'
                : completedCourses.length > 0
                  ? `You've completed ${completedCourses.length} course${completedCourses.length > 1 ? 's' : ''} so far. Keep it up!`
                  : `You have ${inProgress.length} course${inProgress.length !== 1 ? 's' : ''} in progress. Let's keep the momentum going.`}
            </p>
          </div>

          {continueCourse && (
            <div
              className="continue-card"
              onClick={() => navigate(`/courses/${continueCourse.course.slug}`)}
            >
              <div className="continue-label">
                <span className="pulse-dot"></span>
                Continue learning
              </div>
              <div className="continue-emoji">{continueCourse.course.thumbnail_emoji}</div>
              <div className="continue-title">{continueCourse.course.title}</div>
              <div className="continue-instr">by {continueCourse.course.instructor_name}</div>
              <div className="continue-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${continueCourse.progress_percent}%` }}></div>
                </div>
                <div className="continue-meta">
                  <span>{continueCourse.progress_percent}% complete</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======= STATS GRID ======= */}
      <div className="dash-section">
        <div className="dash-stats-grid">
          <div className="stat-box stat-box-accent">
            <div className="stat-box-icon">📚</div>
            <div className="stat-box-value">{enrollments.length}</div>
            <div className="stat-box-label">Courses enrolled</div>
          </div>
          <div className="stat-box">
            <div className="stat-box-icon">🎯</div>
            <div className="stat-box-value">{inProgress.length}</div>
            <div className="stat-box-label">In progress</div>
          </div>
          <div className="stat-box">
            <div className="stat-box-icon">🏆</div>
            <div className="stat-box-value">{completedCourses.length}</div>
            <div className="stat-box-label">Completed</div>
          </div>
          <div className="stat-box">
            <div className="stat-box-icon">📊</div>
            <div className="stat-box-value">{avgProgress}<span style={{fontSize:'1.5rem'}}>%</span></div>
            <div className="stat-box-label">Avg. progress</div>
          </div>
        </div>
      </div>

      {/* ======= IN PROGRESS ======= */}
      {inProgress.length > 0 && (
        <div className="dash-section">
          <div className="section-head">
            <h2 className="section-title">In <em>progress</em></h2>
            <div className="section-count">{inProgress.length} course{inProgress.length !== 1 ? 's' : ''}</div>
          </div>

          <div className="course-grid-rich">
            {inProgress.map(e => (
              <div
                key={e.id}
                className="course-card-rich"
                onClick={() => navigate(`/courses/${e.course.slug}`)}
              >
                <div className="course-card-top">
                  <div className="course-emoji-big">{e.course.thumbnail_emoji}</div>
                  <div className={`level-pill level-${e.course.level}`}>
                    {e.course.level}
                  </div>
                </div>
                <div className="course-category">{e.course.category}</div>
                <h3 className="course-title-rich">{e.course.title}</h3>
                <div className="course-instr-row">
                  <div className="instr-dot"></div>
                  <span>{e.course.instructor_name}</span>
                </div>
                <div className="course-progress-rich">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${e.progress_percent}%` }}></div>
                  </div>
                  <div className="progress-meta-rich">
                    <span>{e.progress_percent}% complete</span>
                    <span className="arrow-pill">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======= NOT STARTED ======= */}
      {notStarted.length > 0 && (
        <div className="dash-section">
          <div className="section-head">
            <h2 className="section-title">Haven't <em>started</em> yet</h2>
            <div className="section-count">{notStarted.length} course{notStarted.length !== 1 ? 's' : ''}</div>
          </div>

          <div className="course-grid-rich">
            {notStarted.map(e => (
              <div
                key={e.id}
                className="course-card-rich"
                onClick={() => navigate(`/courses/${e.course.slug}`)}
              >
                <div className="course-card-top">
                  <div className="course-emoji-big">{e.course.thumbnail_emoji}</div>
                  <div className={`level-pill level-${e.course.level}`}>{e.course.level}</div>
                </div>
                <div className="course-category">{e.course.category}</div>
                <h3 className="course-title-rich">{e.course.title}</h3>
                <div className="course-instr-row">
                  <div className="instr-dot"></div>
                  <span>{e.course.instructor_name}</span>
                </div>
                <div className="begin-cta">
                  <span>Start learning</span>
                  <span className="arrow-pill">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======= COMPLETED ======= */}
      {completedCourses.length > 0 && (
        <div className="dash-section">
          <div className="section-head">
            <h2 className="section-title"><em>Completed</em> 🏆</h2>
            <div className="section-count">{completedCourses.length} course{completedCourses.length !== 1 ? 's' : ''}</div>
          </div>

          <div className="course-grid-rich">
            {completedCourses.map(e => (
              <div
                key={e.id}
                className="course-card-rich completed"
                onClick={() => navigate(`/courses/${e.course.slug}`)}
              >
                <div className="completed-badge">✓ Completed</div>
                <div className="course-card-top">
                  <div className="course-emoji-big">{e.course.thumbnail_emoji}</div>
                  <div className={`level-pill level-${e.course.level}`}>{e.course.level}</div>
                </div>
                <div className="course-category">{e.course.category}</div>
                <h3 className="course-title-rich">{e.course.title}</h3>
                <div className="course-instr-row">
                  <div className="instr-dot"></div>
                  <span>{e.course.instructor_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======= EMPTY STATE ======= */}
      {enrollments.length === 0 && (
        <div className="dash-section">
          <div className="empty-state-big">
            <div className="empty-emoji">🎒</div>
            <h3>Your learning journey starts here</h3>
            <p>You haven't enrolled in any courses yet. Explore the catalog and pick something that interests you.</p>
          </div>
        </div>
      )}
    </div>
  )
}
