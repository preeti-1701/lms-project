import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function Lesson({ user }) {
  const { slug, lessonId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completedIds, setCompletedIds] = useState(new Set())
  const [isCompleted, setIsCompleted] = useState(false)

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

  // Load progress from /api/me/
  useEffect(() => {
    api.me()
      .then(data => {
        const enr = data.enrollments.find(e => e.course.slug === slug)
        // We don't have per-lesson progress here, but we can track locally
      })
      .catch(() => {})
  }, [slug])

  // Content protection (SRS §4)
  useEffect(() => {
    const showNotice = (msg) => {
      const n = document.createElement('div')
      n.className = 'protection-notice'
      n.textContent = msg
      document.body.appendChild(n)
      setTimeout(() => n.remove(), 3000)
    }

    const handleContextMenu = (e) => {
      e.preventDefault()
      showNotice('Right-click is disabled on protected learning content.')
    }
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 's')) ||
        (e.metaKey && e.altKey && e.key === 'i') ||
        e.key === 'PrintScreen'
      ) {
        e.preventDefault()
        showNotice('This action is blocked while viewing protected content.')
      }
    }
    const handleKeyUp = (e) => {
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('').catch(() => {})
        showNotice('Screenshot detected. This activity has been recorded.')
      }
    }
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const handleMarkComplete = async () => {
    try {
      const result = await api.markLessonComplete(lesson.id)
      setIsCompleted(true)
      setCompletedIds(prev => new Set([...prev, lesson.id]))
      if (result.completed) {
        alert('🎉 Program completed! Great work!')
      }
    } catch (err) {
      alert('Failed to mark complete: ' + err.message)
    }
  }

  if (loading) return <div className="loading">Opening chapter</div>
  if (!lesson) return <div className="container"><p>Chapter not found</p></div>

  const lessons = course.lessons || []
  const currentIdx = lessons.findIndex(l => l.id === lesson.id)
  const prev = currentIdx > 0 ? lessons[currentIdx - 1] : null
  const next = currentIdx < lessons.length - 1 ? lessons[currentIdx + 1] : null
  const quiz = course.quizzes?.[0]

  return (
    <div className="lesson-layout">
      <aside className="lesson-sidebar">
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--rule)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-softer)', marginBottom: '0.3rem' }}>
            Program
          </div>
          <a onClick={() => navigate(`/courses/${slug}`)} style={{ cursor: 'pointer', fontWeight: 500, color: 'var(--ink)' }}>
            {course.title}
          </a>
        </div>

        <h3>Chapters</h3>
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
            <div
              className="lesson-side-item"
              onClick={() => navigate(`/quiz/${quiz.id}`)}
            >
              <span style={{ fontSize: '1rem' }}>🧠</span>
              <span>Start the quiz →</span>
            </div>
          </>
        )}
      </aside>

      <div className="lesson-main">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-softer)', marginBottom: '1rem' }}>
          ◇ {course.title} / Chapter {lesson.order}
        </div>
        <h1>{lesson.title}</h1>

        {lesson.video_url && (
          <div className="video-link-card">
            <div className="video-link-label">
              🎬 Lesson resource
            </div>
            <a
              href={lesson.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="video-link-url"
            >
              {lesson.video_url}
              <span className="video-link-arrow">↗</span>
            </a>
            <div className="video-link-notice">
              🔒 This resource is associated with <strong>{user.username}</strong>. Please don’t share it publicly.
            </div>
          </div>
        )}

        <div className="lesson-body">{lesson.content}</div>

        <div className="lesson-actions">
          <div>
            {prev && (
              <button className="btn btn-secondary" onClick={() => navigate(`/courses/${slug}/lessons/${prev.id}`)}>
                ← Back
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {!isCompleted ? (
              <button className="btn btn-accent" onClick={handleMarkComplete}>
                ✓ Mark done
              </button>
            ) : (
              <span className="btn" style={{ color: 'var(--success)', borderColor: 'var(--success)', cursor: 'default' }}>
                ✓ Done
              </span>
            )}
            {next && (
              <button className="btn btn-primary" onClick={() => navigate(`/courses/${slug}/lessons/${next.id}`)}>
                Continue →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
