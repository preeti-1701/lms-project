import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function Quiz({ user }) {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.quiz(quizId)
      .then(data => {
        setQuiz(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [quizId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (Object.keys(answers).length < quiz.questions.length) {
      alert('Please answer all questions')
      return
    }
    setSubmitting(true)
    try {
      const res = await api.submitQuiz(quizId, answers)
      setResult(res)
    } catch (err) {
      alert('Submission failed: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetry = () => {
    setResult(null)
    setAnswers({})
  }

  if (loading) return <div className="loading">Loading quiz</div>
  if (!quiz) return <div className="container"><p>Quiz not found</p></div>

  // ========= RESULT VIEW =========
  if (result) {
    return (
      <div className="result-wrap">
        <div className="kicker" style={{ justifyContent: 'center' }}>
          <span className="kicker-dot"></span>
          Quiz Result
        </div>
        <h1>
          {result.passed ? (
            <>You <em>passed!</em> 🎉</>
          ) : (
            <>Not quite <em>yet</em>.</>
          )}
        </h1>

        <div className={`score-ring ${!result.passed ? 'failed' : ''}`}>
          <div className="score">
            {result.score}<span style={{ fontSize: '1.5rem' }}>%</span>
          </div>
          <div className="sublabel">{result.correct} / {result.total} correct</div>
        </div>

        <p style={{ color: 'var(--ink-softer)', marginBottom: '2rem' }}>
          {result.passed
            ? `Great work — you scored above the ${result.pass_score}% passing threshold.`
            : `You needed ${result.pass_score}% to pass. Review the lessons and try again.`}
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            Back to dashboard
          </button>
          <button className="btn btn-accent" onClick={handleRetry}>
            Try again →
          </button>
        </div>
      </div>
    )
  }

  // ========= QUIZ TAKING VIEW =========
  return (
    <div className="quiz-wrap">
      <div className="quiz-header">
        <div className="kicker" style={{ justifyContent: 'center' }}>
          <span className="kicker-dot"></span>
          Quiz
        </div>
        <h1>{quiz.title}</h1>
        {quiz.description && (
          <p style={{ color: 'var(--ink-softer)', marginTop: '1rem' }}>{quiz.description}</p>
        )}
        <p style={{ color: 'var(--ink-softer)', marginTop: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          {quiz.questions.length} questions · Pass at {quiz.pass_score}%
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {quiz.questions.map((q, idx) => (
          <div key={q.id} className="q-card">
            <div className="q-num">Question {idx + 1} of {quiz.questions.length}</div>
            <div className="q-text">{q.text}</div>

            {['A', 'B', 'C', 'D'].map(letter => {
              const key = `choice_${letter.toLowerCase()}`
              const val = q[key]
              return (
                <label
                  key={letter}
                  className={`choice-row ${answers[q.id] === letter ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={`q_${q.id}`}
                    value={letter}
                    checked={answers[q.id] === letter}
                    onChange={() => setAnswers(prev => ({ ...prev, [q.id]: letter }))}
                    required
                  />
                  <strong>{letter}.</strong> {val}
                </label>
              )
            })}
          </div>
        ))}

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            type="submit"
            className="btn btn-accent"
            disabled={submitting}
            style={{ padding: '1rem 3rem', fontSize: '1.05rem' }}
          >
            {submitting ? 'Grading...' : 'Submit quiz →'}
          </button>
        </div>
      </form>
    </div>
  )
}
