import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function CourseDetail({ user }) {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.course(slug)
      .then(data => {
        setCourse(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [slug])

  if (loading) return <div className="loading">Loading program</div>
  if (error) return <div className="container"><p>Error: {error}</p></div>

  const lessons = course.lessons || []

  return (
    <>
      <div className="detail-hero">
        <div>
          <div className="kicker">
            <span className="kicker-dot"></span>
            Program
          </div>
          <div className="emoji">{course.thumbnail_emoji}</div>
          <h1>{course.title}</h1>
          <p className="desc">{course.description}</p>
          <div className="detail-meta">
            <span>👤 {course.instructor?.first_name} {course.instructor?.last_name}</span>
            <span>📖 {lessons.length} lessons</span>
            <span>🎯 Level: {course.level}</span>
            <span>📂 Topic: {course.category}</span>
          </div>
        </div>

        <div className="enroll-card">
          <div className="kicker">
            <span className="kicker-dot" style={{ background: 'var(--accent)' }}></span>
            Start here
          </div>
          <h3>Open lesson 1</h3>
          {lessons.length > 0 && (
            <button
              className="btn btn-accent"
              onClick={() => navigate(`/courses/${slug}/lessons/${lessons[0].id}`)}
            >
              Begin →
            </button>
          )}
        </div>
      </div>

      <div className="lessons-list">
        <h2>Lesson list</h2>
        {lessons.map((lesson, idx) => (
          <div
            key={lesson.id}
            className="lesson-row"
            onClick={() => navigate(`/courses/${slug}/lessons/${lesson.id}`)}
          >
            <div className="lesson-num">{String(idx + 1).padStart(2, '0')}</div>
            <div>
              <div className="title">{lesson.title}</div>
              <div className="duration">⏱ {lesson.duration_minutes} min{lesson.video_url && ' · 🎬 resource'}</div>
            </div>
            <div style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>→</div>
          </div>
        ))}
      </div>
    </>
  )
}
