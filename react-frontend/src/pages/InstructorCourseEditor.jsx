import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'

const LEVELS = ['beginner', 'intermediate', 'advanced']
const EMOJIS = ['📚', '🐍', '🎨', '⚙️', '💻', '🧠', '🚀', '📊', '🔬', '📝', '🌐', '🎯']

export default function InstructorCourseEditor({ user, mode = 'edit' }) {
  const { slug } = useParams()
  const navigate = useNavigate()
  const isNew = mode === 'new'

  const [form, setForm] = useState({
    title: '',
    description: '',
    level: 'beginner',
    category: '',
    thumbnail_emoji: '📚',
    accent_color: '#c8552c',
    is_published: false,
  })
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [showLessonForm, setShowLessonForm] = useState(false)
  const [showQuizForm, setShowQuizForm] = useState(false)
  const [editingLesson, setEditingLesson] = useState(null)
  const [editingQuizId, setEditingQuizId] = useState(null)

  useEffect(() => {
    if (isNew) return
    api.instructorCourse(slug)
      .then(c => {
        setCourse(c)
        setForm({
          title: c.title,
          description: c.description,
          level: c.level,
          category: c.category,
          thumbnail_emoji: c.thumbnail_emoji,
          accent_color: c.accent_color,
          is_published: c.is_published,
        })
        setLoading(false)
      })
      .catch(err => {
        alert('Failed to load: ' + err.message)
        navigate('/instructor')
      })
  }, [slug, isNew])

  const reload = () => {
    if (isNew) return
    api.instructorCourse(slug).then(setCourse)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (isNew) {
        const res = await api.instructorCreateCourse(form)
        navigate(`/instructor/courses/${res.slug}`)
      } else {
        await api.instructorUpdateCourse(slug, form)
        reload()
      }
    } catch (err) {
      alert('Save failed: ' + err.message)
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "${form.title}"? This will also delete all lessons, quizzes, and enrollments. This cannot be undone.`)) return
    try {
      await api.instructorDeleteCourse(slug)
      navigate('/instructor')
    } catch (err) {
      alert('Delete failed: ' + err.message)
    }
  }

  if (loading) return <div className="loading">Loading course</div>

  return (
    <div className="dash-wrap">
      <div className="dash-hero-strip">
        <div>
          <div className="kicker">
            <span className="kicker-dot"></span>
            <a onClick={() => navigate('/instructor')} style={{ cursor: 'pointer' }}>← Back to dashboard</a>
          </div>
          <h1 className="display dash-greeting">
            {isNew ? <>New <em>course.</em></> : <>Edit <em>{form.title || 'course'}.</em></>}
          </h1>
        </div>
      </div>

      <div className="dash-section">
        <h2 className="section-title">Course <em>overview</em></h2>

        <div className="course-summary-card">
          <div className="course-summary-emoji">{form.thumbnail_emoji}</div>
          <div className="course-summary-info">
            <div className="course-summary-cat">{form.category}</div>
            <h3 className="course-summary-title">{form.title}</h3>
            <p className="course-summary-desc">{form.description}</p>
            <div className="course-summary-meta">
              <span className={`level-pill level-${form.level}`}>{form.level}</span>
              {form.is_published ? (
                <span className="status-pill status-published">● Published</span>
              ) : (
                <span className="status-pill status-draft">○ Draft</span>
              )}
              <span className="course-summary-students">👥 {course?.enrollment_count || 0} students enrolled</span>
            </div>
            <p className="course-summary-note">
              Course details are managed by your administrator. You can manage lessons and quizzes below.
            </p>
          </div>
        </div>
      </div>

      {!isNew && course && (
        <>
          {/* Lessons */}
          <div className="dash-section">
            <div className="section-head">
              <h2 className="section-title"><em>{course.lessons.length}</em> lesson{course.lessons.length !== 1 ? 's' : ''}</h2>
              <button className="btn btn-accent" onClick={() => { setEditingLesson(null); setShowLessonForm(true); }}>
                + Add lesson
              </button>
            </div>

            {showLessonForm && (
              <LessonForm
                slug={slug}
                lesson={editingLesson}
                onCancel={() => { setShowLessonForm(false); setEditingLesson(null); }}
                onSaved={() => { setShowLessonForm(false); setEditingLesson(null); reload(); }}
              />
            )}

            {course.lessons.length === 0 && !showLessonForm ? (
              <div className="empty-state-big">
                <div className="empty-emoji">📝</div>
                <h3>No lessons yet</h3>
                <p>Click "Add lesson" to get started.</p>
              </div>
            ) : (
              <div className="lesson-edit-list">
                {course.lessons.sort((a,b) => a.order - b.order).map(l => (
                  <div key={l.id} className="lesson-edit-row">
                    <div className="lesson-edit-num">#{l.order}</div>
                    <div className="lesson-edit-info">
                      <div className="lesson-edit-title">{l.title}</div>
                      <div className="lesson-edit-meta">
                        {l.video_url ? '🎬 Has video' : '📄 No video'} · {l.duration_minutes} min
                      </div>
                    </div>
                    <div className="lesson-edit-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => { setEditingLesson(l); setShowLessonForm(true); }}>
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={async () => {
                          if (confirm(`Delete lesson "${l.title}"?`)) {
                            await api.instructorDeleteLesson(l.id)
                            reload()
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quizzes */}
          <div className="dash-section">
            <div className="section-head">
              <h2 className="section-title"><em>{course.quizzes.length}</em> quiz{course.quizzes.length !== 1 ? 'zes' : ''}</h2>
              <button className="btn btn-accent" onClick={() => { setEditingQuizId(null); setShowQuizForm(true); }}>
                + Add quiz
              </button>
            </div>

            {showQuizForm && (
              <QuizForm
                slug={slug}
                quizId={editingQuizId}
                onCancel={() => { setShowQuizForm(false); setEditingQuizId(null); }}
                onSaved={() => { setShowQuizForm(false); setEditingQuizId(null); reload(); }}
              />
            )}

            {course.quizzes.length === 0 && !showQuizForm ? (
              <div className="empty-state-big">
                <div className="empty-emoji">🧠</div>
                <h3>No quizzes yet</h3>
                <p>Quizzes help students test their understanding.</p>
              </div>
            ) : (
              <div className="lesson-edit-list">
                {course.quizzes.map(q => (
                  <div key={q.id} className="lesson-edit-row">
                    <div className="lesson-edit-num">🧠</div>
                    <div className="lesson-edit-info">
                      <div className="lesson-edit-title">{q.title}</div>
                      <div className="lesson-edit-meta">
                        {q.question_count} questions · pass at {q.pass_score}%
                      </div>
                    </div>
                    <div className="lesson-edit-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => { setEditingQuizId(q.id); setShowQuizForm(true); }}>
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={async () => {
                          if (confirm(`Delete quiz "${q.title}"?`)) {
                            await api.instructorDeleteQuiz(q.id)
                            reload()
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// =================== LESSON FORM ===================
function LessonForm({ slug, lesson, onCancel, onSaved }) {
  const isNew = !lesson
  const [form, setForm] = useState({
    title: lesson?.title || '',
    content: lesson?.content || '',
    video_url: lesson?.video_url || '',
    duration_minutes: lesson?.duration_minutes || 10,
    order: lesson?.order || 1,
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.title.trim()) {
      alert('Lesson title is required')
      return
    }
    setSaving(true)
    try {
      if (isNew) {
        await api.instructorCreateLesson(slug, form)
      } else {
        await api.instructorUpdateLesson(lesson.id, form)
      }
      onSaved()
    } catch (err) {
      alert('Save failed: ' + err.message)
    }
    setSaving(false)
  }

  return (
    <div className="editor-card">
      <h3 className="editor-card-title">{isNew ? 'New lesson' : 'Edit lesson'}</h3>
      <div className="editor-form">
        <label className="editor-label">
          Title
          <input
            type="text"
            value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
            placeholder="e.g. Variables and Data Types"
            className="editor-input"
          />
        </label>
        <label className="editor-label">
          Content (text/markdown)
          <textarea
            value={form.content}
            onChange={e => setForm({...form, content: e.target.value})}
            placeholder="Write the lesson content here..."
            rows={6}
            className="editor-input"
          />
        </label>
        <label className="editor-label">
          YouTube video URL (optional)
          <input
            type="url"
            value={form.video_url}
            onChange={e => setForm({...form, video_url: e.target.value})}
            placeholder="https://www.youtube.com/watch?v=..."
            className="editor-input"
          />
        </label>
        <div className="editor-row">
          <label className="editor-label" style={{ flex: 1 }}>
            Order
            <input
              type="number"
              value={form.order}
              min="1"
              onChange={e => setForm({...form, order: parseInt(e.target.value) || 1})}
              className="editor-input"
            />
          </label>
          <label className="editor-label" style={{ flex: 1 }}>
            Duration (minutes)
            <input
              type="number"
              value={form.duration_minutes}
              min="1"
              onChange={e => setForm({...form, duration_minutes: parseInt(e.target.value) || 10})}
              className="editor-input"
            />
          </label>
        </div>
        <div className="editor-actions">
          <button className="btn btn-accent" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : (isNew ? 'Add lesson' : 'Save lesson')}
          </button>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

// =================== QUIZ FORM ===================
function QuizForm({ slug, quizId, onCancel, onSaved }) {
  const isNew = !quizId
  const [form, setForm] = useState({
    title: '',
    description: '',
    pass_score: 70,
    questions: [{ text: '', choice_a: '', choice_b: '', choice_c: '', choice_d: '', correct_answer: 'A' }],
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!isNew)

  useEffect(() => {
    if (isNew) return
    api.instructorQuiz(quizId).then(q => {
      setForm({
        title: q.title,
        description: q.description,
        pass_score: q.pass_score,
        questions: q.questions.length > 0 ? q.questions.map(qq => ({
          text: qq.text,
          choice_a: qq.choice_a,
          choice_b: qq.choice_b,
          choice_c: qq.choice_c,
          choice_d: qq.choice_d,
          correct_answer: qq.correct_answer,
        })) : [{ text: '', choice_a: '', choice_b: '', choice_c: '', choice_d: '', correct_answer: 'A' }],
      })
      setLoading(false)
    })
  }, [quizId, isNew])

  const updateQ = (idx, field, value) => {
    const newQs = [...form.questions]
    newQs[idx] = { ...newQs[idx], [field]: value }
    setForm({...form, questions: newQs})
  }

  const addQ = () => setForm({
    ...form,
    questions: [...form.questions, { text: '', choice_a: '', choice_b: '', choice_c: '', choice_d: '', correct_answer: 'A' }],
  })

  const removeQ = (idx) => setForm({
    ...form,
    questions: form.questions.filter((_, i) => i !== idx),
  })

  const handleSave = async () => {
    if (!form.title.trim()) {
      alert('Quiz title is required')
      return
    }
    if (form.questions.length === 0) {
      alert('Add at least one question')
      return
    }
    for (let i = 0; i < form.questions.length; i++) {
      const q = form.questions[i]
      if (!q.text.trim() || !q.choice_a.trim() || !q.choice_b.trim() || !q.choice_c.trim() || !q.choice_d.trim()) {
        alert(`Question ${i + 1}: all fields (question text + 4 choices) are required`)
        return
      }
    }
    setSaving(true)
    try {
      if (isNew) {
        await api.instructorCreateQuiz(slug, form)
      } else {
        await api.instructorUpdateQuiz(quizId, form)
      }
      onSaved()
    } catch (err) {
      alert('Save failed: ' + err.message)
    }
    setSaving(false)
  }

  if (loading) return <div className="editor-card">Loading quiz...</div>

  return (
    <div className="editor-card">
      <h3 className="editor-card-title">{isNew ? 'New quiz' : 'Edit quiz'}</h3>
      <div className="editor-form">
        <label className="editor-label">
          Quiz title
          <input
            type="text"
            value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
            placeholder="e.g. Python Basics Quiz"
            className="editor-input"
          />
        </label>
        <label className="editor-label">
          Description
          <input
            type="text"
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
            placeholder="Test your knowledge of..."
            className="editor-input"
          />
        </label>
        <label className="editor-label">
          Pass score (0-100)
          <input
            type="number"
            min="0"
            max="100"
            value={form.pass_score}
            onChange={e => setForm({...form, pass_score: parseInt(e.target.value) || 70})}
            className="editor-input"
            style={{ maxWidth: '200px' }}
          />
        </label>

        <div style={{ marginTop: '1rem' }}>
          <h4 style={{ marginBottom: '1rem' }}>Questions ({form.questions.length})</h4>
          {form.questions.map((q, idx) => (
            <div key={idx} className="quiz-question-card">
              <div className="quiz-q-head">
                <span>Q{idx + 1}</span>
                {form.questions.length > 1 && (
                  <button className="btn btn-danger btn-sm" onClick={() => removeQ(idx)}>Remove</button>
                )}
              </div>
              <input
                type="text"
                value={q.text}
                onChange={e => updateQ(idx, 'text', e.target.value)}
                placeholder="Question text..."
                className="editor-input"
              />
              {['a', 'b', 'c', 'd'].map(letter => (
                <div key={letter} className="quiz-choice-row">
                  <label className="quiz-correct-radio">
                    <input
                      type="radio"
                      name={`correct-${idx}`}
                      checked={q.correct_answer === letter.toUpperCase()}
                      onChange={() => updateQ(idx, 'correct_answer', letter.toUpperCase())}
                    />
                    <span>{letter.toUpperCase()}</span>
                  </label>
                  <input
                    type="text"
                    value={q[`choice_${letter}`]}
                    onChange={e => updateQ(idx, `choice_${letter}`, e.target.value)}
                    placeholder={`Choice ${letter.toUpperCase()}`}
                    className="editor-input"
                  />
                </div>
              ))}
            </div>
          ))}
          <button className="btn btn-secondary" onClick={addQ}>+ Add another question</button>
        </div>

        <div className="editor-actions">
          <button className="btn btn-accent" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : (isNew ? 'Create quiz' : 'Save quiz')}
          </button>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
