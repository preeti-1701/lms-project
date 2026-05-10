import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import useProtection from '../hooks/useProtection'

function getCompletedKey(slug) {
  return `coursify_completed_${slug}`
}
function loadCompleted(slug) {
  try {
    const raw = localStorage.getItem(getCompletedKey(slug))
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}
function saveCompleted(slug, set) {
  try {
    localStorage.setItem(getCompletedKey(slug), JSON.stringify([...set]))
  } catch {}
}

export default function Lesson({ user }) {
  useProtection()
  const { slug, lessonId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completedIds, setCompletedIds] = useState(() => loadCompleted(slug))

  const isCompleted = lesson ? completedIds.has(lesson.id) : false

  useEffect(() => {
    api.course(slug)
      .then(data => {
        setCourse(data)
        const l = data.lessons.find(x => String(x.id) === lessonId)
        setLesson(l)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug, lessonId])

  useEffect(() => {
    setCompletedIds(loadCompleted(slug))
  }, [slug, lessonId])

  useEffect(() => {
    api.me()
      .then(data => {
        const enr = data.enrollments?.find(e => e.course.slug === slug)
        if (enr && enr.progress_percent === 0) {
          const empty = new Set()
          setCompletedIds(empty)
          saveCompleted(slug, empty)
        }
      })
      .catch(() => {})
  }, [slug])

  const handleMarkComplete = async () => {
    try {
      const result = await api.markLessonComplete(lesson.id)
      const newSet = new Set([...completedIds, lesson.id])
      setCompletedIds(newSet)
      saveCompleted(slug, newSet)
      if (result.completed) {
        alert('Course completed! Congratulations!')
      }
    } catch (err) {
      alert('Failed to mark complete: ' + err.message)
    }
  }

  if (loading) return <div className="loading">Loading lesson</div>
  if (!lesson) return <div className="container"><p>Lesson not found</p></div>

  const lessons = course.lessons || []
  const currentIdx = lessons.findIndex(l => l.id === lesson.id)
  const prev = currentIdx > 0 ? lessons[currentIdx - 1] : null
  const next = currentIdx < lessons.length - 1 ? lessons[currentIdx + 1] : null
  const quiz = course.quizzes?.[0]

  const videoCardStyle = {
    margin: '1.5rem 0 2rem',
    padding: '1.5rem',
    background: 'var(--paper)',
    border: '1px dashed var(--rule)',
    borderRadius: 'var(--radius)',
  }
  const videoLabelStyle = {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--ink-softer)',
    marginBottom: '0.75rem',
  }
  const videoLinkStyle = {
    display: 'block',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.95rem',
    color: 'var(--accent)',
    textDecoration: 'none',
    wordBreak: 'break-all',
    padding: '0.75rem',
    background: 'rgba(200, 85, 44, 0.05)',
    borderRadius: '4px',
    marginBottom: '0.75rem',
  }

  // Watermark text and overlay (covers the entire lesson area)
  const watermarkText = `${user.username} · ${user.email || 'no email'}`
  const watermarkRows = Array.from({ length: 8 }, (_, i) => i)

  return (
    <div className="lesson-layout">
      <aside className="lesson-sidebar">
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--rule)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-softer)', marginBottom: '0.3rem' }}>
            Course
          </div>
          <a onClick={() => navigate(`/courses/${slug}`)} style={{ cursor: 'pointer', fontWeight: 500, color: 'var(--ink)' }}>
            {course.title}
          </a>
        </div>

        <h3>Lessons</h3>
        {lessons.map((l, idx) => (
          <div
            key={l.id}
            className={`lesson-side-item ${l.id === lesson.id ? 'active' : ''}`}
            onClick={() => navigate(`/courses/${slug}/lessons/${l.id}`)}
          >
            <span className={`check ${completedIds.has(l.id) ? 'done' : ''}`}>
              {completedIds.has(l.id) && '✓'}
            </span>
            <span>{String(idx + 1).padStart(2, '0')}. {l.title}</span>
          </div>
        ))}

        {quiz && (
          <>
            <h3 style={{ marginTop: '1.5rem' }}>Quiz</h3>
            <div className="lesson-side-item" onClick={() => navigate(`/quiz/${quiz.id}`)}>
              <span style={{ fontSize: '1rem' }}>🧠</span>
              <span>Take the quiz →</span>
            </div>
          </>
        )}
      </aside>

      <div className="lesson-main" style={{ position: 'relative' }}>
        {/* Watermark overlay — covers entire lesson area */}
        <div className="lesson-watermark-overlay" aria-hidden="true">
          {watermarkRows.map(row => (
            <div key={row} className="lesson-watermark-row">
              {Array.from({ length: 5 }, (_, c) => (
                <span key={c} className="lesson-watermark-text">{watermarkText}</span>
              ))}
            </div>
          ))}
        </div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-softer)', marginBottom: '1rem' }}>
            ◇ {course.title} / Lesson {lesson.order}
          </div>
          <h1>{lesson.title}</h1>

          {lesson.video_url && (
            <div style={videoCardStyle}>
              <div style={videoLabelStyle}>🎬 Video resource</div>
              <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" style={videoLinkStyle}>
                {lesson.video_url} ↗
              </a>
              <div style={{ fontSize: '0.85rem', color: 'var(--ink-softer)', fontStyle: 'italic' }}>
                🔒 Licensed to <strong>{user.username}</strong>. Do not share.
              </div>
            </div>
          )}

          <div className="lesson-body">{lesson.content}</div>

          <div className="lesson-actions">
            <div>
              {prev && (
                <button className="btn btn-secondary" onClick={() => navigate(`/courses/${slug}/lessons/${prev.id}`)}>
                  ← Previous
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {!isCompleted ? (
                <button className="btn btn-accent" onClick={handleMarkComplete}>
                  ✓ Mark complete
                </button>
              ) : (
                <span className="btn" style={{ color: 'var(--success)', borderColor: 'var(--success)', cursor: 'default' }}>
                  ✓ Completed
                </span>
              )}
              {next && (
                <button className="btn btn-primary" onClick={() => navigate(`/courses/${slug}/lessons/${next.id}`)}>
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
