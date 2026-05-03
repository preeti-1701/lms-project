import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import {
  BookOpen, Clock, GraduationCap, PlayCircle, CheckCircle2, Circle,
  Award, ChevronLeft, FileText, BarChart3
} from 'lucide-react'

const safeArray = (data) => Array.isArray(data) ? data : (data?.results || [])

export default function CourseDetail() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    if (!id) return
    fetchCourse()
    if (user?.role === 'student') {
      fetchProgress()
    }
  }, [id, user])

  const fetchCourse = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/courses/${id}/`)
      setCourse(res.data)
    } catch (err) {
      console.error(err)
      setError('Failed to load course')
    } finally {
      setLoading(false)
    }
  }

  const fetchProgress = async () => {
    try {
      const res = await api.get('/progress/')
      setProgress(safeArray(res.data))
    } catch (err) {
      console.error('Progress error:', err)
    }
  }

  const downloadCertificate = async () => {
    try {
      const response = await api.get(`/courses/${id}/certificate/`, {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'certificate.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      alert('Failed to download certificate')
    }
  }

  const isLessonCompleted = (lessonId) => {
    return progress.some((p) => p.lesson === lessonId && p.is_completed)
  }

  const lessons = course?.lessons || []
  const totalLessons = lessons.length
  const completedLessons = lessons.filter((l) => isLessonCompleted(l.id)).length
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
  const allCompleted = totalLessons > 0 && completedLessons === totalLessons
  const topicsArray = Array.isArray(course?.topics)
    ? course.topics
    : (course?.topics || '').split(',').map(t => t.trim()).filter(Boolean)

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="p-4 bg-red-50 text-red-600 rounded-xl">
          {error || 'Course not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back Link */}
      <Link to="/courses" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary mb-6 transition">
        <ChevronLeft className="w-4 h-4" /> Back to Courses
      </Link>

      {/* Hero Card */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden mb-8">
        <div className="h-40 md:h-56 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
          <BookOpen className="w-16 h-16 text-primary/20" />
        </div>
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-text">{course.title}</h1>
              <p className="text-text-muted mt-2 leading-relaxed max-w-2xl">{course.description || 'No description available.'}</p>

              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-text-muted">
                <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4" /> {course.trainer_name}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {course.duration || '0'}h</span>
                <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> {totalLessons} lessons</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${course.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  {course.status === 'active' ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col gap-3 min-w-[200px]">
              {user?.role === 'student' && (
                <>
                  <Link
                    to={`/courses/${id}/learn`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition shadow-sm"
                  >
                    <PlayCircle className="w-5 h-5" /> {completedLessons > 0 ? 'Continue Learning' : 'Start Learning'}
                  </Link>

                  {allCompleted && (
                    <button
                      onClick={downloadCertificate}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-xl border border-emerald-200 hover:bg-emerald-100 transition"
                    >
                      <Award className="w-5 h-5" /> Download Certificate
                    </button>
                  )}
                </>
              )}

              {(user?.role === 'trainer' || user?.role === 'admin') && (
                <div className="text-sm text-text-muted bg-slate-50 rounded-xl px-4 py-3 border border-border">
                  <p className="font-medium text-text">Management View</p>
                  <p className="mt-1">You can edit this course from the admin panel.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats + Topics + Lessons Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Lessons */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Curriculum</h2>
              {user?.role === 'student' && (
                <span className="text-sm text-text-muted">{completedLessons}/{totalLessons} completed</span>
              )}
            </div>

            {lessons.length === 0 ? (
              <div className="text-center py-8 text-text-muted text-sm">No lessons available yet.</div>
            ) : (
              <div className="space-y-2">
                {lessons.map((lesson, index) => {
                  const completed = isLessonCompleted(lesson.id)
                  return (
                    <Link
                      key={lesson.id}
                      to={`/courses/${id}/learn`}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-border transition group"
                    >
                      <div className="shrink-0">
                        {completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 group-hover:text-primary transition" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text truncate">{index + 1}. {lesson.title}</p>
                      </div>
                      {completed && <span className="text-xs text-emerald-600 font-medium">Completed</span>}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Sidebar Info */}
        <div className="space-y-6">
          {/* Progress Card */}
          {user?.role === 'student' && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <h3 className="text-sm font-semibold text-text mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" /> Your Progress</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-2xl font-bold text-text">{progressPercent}%</p>
                  <p className="text-xs text-text-muted mt-1">{completedLessons} of {totalLessons} lessons done</p>
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          )}

          {/* Topics Card */}
          {course.topics && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <h3 className="text-sm font-semibold text-text mb-3">Topics Covered</h3>
              <div className="flex flex-wrap gap-2">
                {topicsArray.map((topic, i) => (
                  <span key={i} className="text-xs font-medium px-3 py-1.5 rounded-full bg-primary-light text-primary">{topic}</span>
                ))}
              </div>
            </div>
          )}

          {/* Course Meta */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <h3 className="text-sm font-semibold text-text mb-3">Course Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-text-muted">Status</span><span className="font-medium text-text capitalize">{course.status}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Duration</span><span className="font-medium text-text">{course.duration || '0'}h</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Lessons</span><span className="font-medium text-text">{totalLessons}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Trainer</span><span className="font-medium text-text">{course.trainer_name}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

