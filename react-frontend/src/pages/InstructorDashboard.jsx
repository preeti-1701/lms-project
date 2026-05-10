import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function InstructorDashboard({ user }) {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.instructorStats(), api.instructorCourses()])
      .then(([s, c]) => {
        setStats(s)
        setCourses(c.courses || c)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading console</div>

  const firstName = user.first_name || user.username
  const courseCount = stats?.total_courses || 0
  const lessonCount = stats?.total_lessons || 0
  const quizCount = stats?.total_quizzes || 0
  const studentCount = stats?.total_students || 0

  return (
    <div className="dash-container">
      <div className="dash-header">
        <div className="dash-kicker">● INSTRUCTOR CONSOLE</div>
        <h1 className="dash-greeting">Hello, <em>{firstName}</em>.</h1>
        <p className="dash-sub">
          You're teaching {courseCount} course{courseCount !== 1 ? 's' : ''} and reaching {studentCount} student{studentCount !== 1 ? 's' : ''}.
        </p>
      </div>

      <div className="stat-grid-rich">
        <div className="stat-box-rich">
          <div className="stat-emoji">📚</div>
          <div className="stat-text">
            <div className="stat-box-value">{courseCount}</div>
            <div className="stat-box-label">Courses</div>
          </div>
        </div>
        <div className="stat-box-rich">
          <div className="stat-emoji">📝</div>
          <div className="stat-text">
            <div className="stat-box-value">{lessonCount}</div>
            <div className="stat-box-label">Lessons</div>
          </div>
        </div>
        <div className="stat-box-rich">
          <div className="stat-emoji">🧠</div>
          <div className="stat-text">
            <div className="stat-box-value">{quizCount}</div>
            <div className="stat-box-label">Quizzes</div>
          </div>
        </div>
        <div className="stat-box-rich">
          <div className="stat-emoji">👥</div>
          <div className="stat-text">
            <div className="stat-box-value">{studentCount}</div>
            <div className="stat-box-label">Students</div>
          </div>
        </div>
      </div>

      <div className="dash-section">
        <div className="section-head">
          <h2 className="section-title">Your <em>assigned courses</em></h2>
          <div className="section-count">{courses.length} course{courses.length !== 1 ? 's' : ''}</div>
        </div>

        {courses.length === 0 ? (
          <div className="empty-state-big">
            <div className="empty-emoji">📋</div>
            <h3>No courses assigned yet</h3>
            <p>Your administrator will assign courses to you. Once assigned, you can manage lessons and quizzes here.</p>
          </div>
        ) : (
          <div className="course-grid-rich">
            {courses.map(c => (
              <div
                key={c.id}
                className="course-card-rich"
                onClick={() => navigate(`/instructor/courses/${c.slug}`)}
              >
                <div className="course-card-top">
                  <div className="course-emoji-big">{c.thumbnail_emoji}</div>
                  <div className={`level-pill level-${c.level}`}>{c.level}</div>
                </div>
                <div className="course-category">{c.category}</div>
                <h3 className="course-title-rich">{c.title}</h3>
                <p className="course-desc-rich">{c.description || <em style={{opacity: 0.4}}>No description</em>}</p>
                <div className="course-foot-rich">
                  <div className="course-meta-row">
                    <span>📖 {c.lesson_count} lessons</span>
                    <span>🧠 {c.quiz_count} quizzes</span>
                    <span>👥 {c.enrollment_count} students</span>
                  </div>
                  <div className="course-status-row">
                    {c.is_published ? (
                      <span className="status-pill status-published">● Published</span>
                    ) : (
                      <span className="status-pill status-draft">○ Draft</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
