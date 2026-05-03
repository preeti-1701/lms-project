import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"
import {
  Play, CheckCircle2, Circle, ChevronLeft, ChevronRight,
  Clock, FileText, Loader2, Award
} from "lucide-react"

const safeArray = (data) => Array.isArray(data) ? data : (data?.results || [])

function getYoutubeEmbedUrl(url) {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  return match ? `https://www.youtube.com/embed/${match[1]}?controls=1&modestbranding=1&rel=0` : null
}

function CircularProgress({ percent, size = 48, stroke = 5 }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (percent / 100) * c
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} stroke="#E2E8F0" strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke="#4F46E5" strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <span className="absolute text-[10px] font-bold text-text">{percent}%</span>
    </div>
  )
}

export default function CoursePlayer() {
  const { id } = useParams()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [progress, setProgress] = useState([])
  const [activeLessonId, setActiveLessonId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!id) return
    fetchCourse()
    if (user?.role === "student") fetchProgress()
  }, [id, user])

  const fetchCourse = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/courses/${id}/`)
      const data = res.data
      setCourse(data)
      const lessons = data.lessons || []
      if (lessons.length > 0 && !activeLessonId) setActiveLessonId(lessons[0].id)
    } catch (err) {
      setError("Failed to load course")
    } finally {
      setLoading(false)
    }
  }

  const fetchProgress = async () => {
    try {
      const res = await api.get("/progress/")
      setProgress(safeArray(res.data))
    } catch { /* ignore */ }
  }

  const markComplete = async (lessonId) => {
    if (!lessonId) return
    try {
      setMarking(true)
      await api.post("/progress/", { lesson: lessonId, is_completed: true })
      fetchProgress()
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update progress")
    } finally {
      setMarking(false)
    }
  }

  const isCompleted = (lessonId) => progress.some((p) => p.lesson === lessonId && p.is_completed)

  const lessons = course?.lessons || []
  const totalLessons = lessons.length
  const completedCount = lessons.filter((l) => isCompleted(l.id)).length
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const activeLesson = lessons.find((l) => l.id === activeLessonId) || lessons[0]
  const activeIndex = lessons.findIndex((l) => l.id === activeLessonId)
  const prevLesson = activeIndex > 0 ? lessons[activeIndex - 1] : null
  const nextLesson = activeIndex < lessons.length - 1 ? lessons[activeIndex + 1] : null

  const embedUrl = getYoutubeEmbedUrl(activeLesson?.youtube_url)
  const allCompleted = totalLessons > 0 && completedCount === totalLessons

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="p-4 bg-red-50 text-red-600 rounded-xl">{error || "Course not found"}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row bg-bg" style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Left: Video + Info */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-20 lg:pb-0">
        <div className="bg-black aspect-video relative">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full absolute inset-0"
              allowFullScreen
              title={activeLesson?.title || "Lesson video"}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/60">
              <div className="text-center">
                <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No video available</p>
              </div>
            </div>
          )}

          {/* Watermark overlay */}
          <div className="absolute bottom-3 right-4 text-white text-xs opacity-60 pointer-events-none select-none">
            © LMS | {user?.email || user?.username || 'Guest'}
          </div>
        </div>

        <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-text">{activeLesson?.title || "Untitled Lesson"}</h1>
            {isCompleted(activeLesson?.id) && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted mb-6">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {course.duration || "0"}h total</span>
            <span className="flex items-center gap-1">Lesson {activeIndex + 1} of {totalLessons}</span>
            <span className="flex items-center gap-1"><Award className="w-4 h-4" /> {progressPercent}% complete</span>
          </div>

          <div className="bg-white rounded-2xl border border-border p-5 md:p-6">
            <h3 className="text-sm font-semibold text-text mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> About this lesson</h3>
            <p className="text-sm text-text-muted leading-relaxed">{course.description || "No description available."}</p>
          </div>

          {allCompleted && user?.role === "student" && (
            <div className="mt-6 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-4">
              <Award className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="font-semibold text-emerald-800">Course Completed!</p>
                <p className="text-sm text-emerald-600">You have finished all lessons. Download your certificate from the course page.</p>
              </div>
            </div>
          )}

          <div className="hidden lg:flex mt-8 items-center justify-between gap-4">
            <button
              onClick={() => prevLesson && setActiveLessonId(prevLesson.id)}
              disabled={!prevLesson}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Lesson
            </button>

            {user?.role === "student" && activeLesson && (
              <button
                onClick={() => markComplete(activeLesson.id)}
                disabled={marking || isCompleted(activeLesson.id)}
                className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-xl transition ${isCompleted(activeLesson.id) ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-primary text-white hover:bg-primary-dark shadow-sm"}`}
              >
                {marking ? <Loader2 className="w-4 h-4 animate-spin" /> : isCompleted(activeLesson.id) ? <><CheckCircle2 className="w-4 h-4" /> Completed</> : <><CheckCircle2 className="w-4 h-4" /> Mark as Complete</>}
              </button>
            )}

            <button
              onClick={() => nextLesson && setActiveLessonId(nextLesson.id)}
              disabled={!nextLesson}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition"
            >
              Next Lesson <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right: Curriculum Sidebar */}
      <div className="w-full lg:w-96 bg-white border-l border-border flex flex-col shrink-0" style={{ maxHeight: "calc(100vh - 64px)" }}>
        <div className="p-4 border-b border-border bg-slate-50/50">
          <h3 className="font-bold text-text truncate">{course.title}</h3>
          <div className="flex items-center gap-3 mt-2">
            <CircularProgress percent={progressPercent} size={40} stroke={4} />
            <div className="flex-1">
              <p className="text-xs text-text-muted">{completedCount} of {totalLessons} completed</p>
              <div className="h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {lessons.map((lesson, idx) => {
            const completed = isCompleted(lesson.id)
            const isActive = lesson.id === activeLessonId
            return (
              <button
                key={lesson.id}
                onClick={() => setActiveLessonId(lesson.id)}
                className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition group ${isActive ? "bg-primary-light border border-primary/20" : "hover:bg-slate-50 border border-transparent"}`}
              >
                <div className="mt-0.5 shrink-0">
                  {completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : isActive ? (
                    <Play className="w-5 h-5 text-primary" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${isActive ? "text-primary" : "text-text group-hover:text-text"}`}>
                    {idx + 1}. {lesson.title}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">{completed ? "Completed" : "Not started"}</p>
                </div>
              </button>
            )
          })}

          {lessons.length === 0 && (
            <div className="text-center py-8 text-text-muted text-sm">No lessons available</div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border px-4 py-3 flex items-center justify-between gap-3 z-20 shadow-lg">
        <button
          onClick={() => prevLesson && setActiveLessonId(prevLesson.id)}
          disabled={!prevLesson}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-xl border border-border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition shrink-0"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>

        {user?.role === "student" && activeLesson && (
          <button
            onClick={() => markComplete(activeLesson.id)}
            disabled={marking || isCompleted(activeLesson.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition shrink-0 ${isCompleted(activeLesson.id) ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-primary text-white hover:bg-primary-dark"}`}
          >
            {marking ? <Loader2 className="w-4 h-4 animate-spin" /> : isCompleted(activeLesson.id) ? <><CheckCircle2 className="w-4 h-4" /> Done</> : <><CheckCircle2 className="w-4 h-4" /> Mark Complete</>}
          </button>
        )}

        <button
          onClick={() => nextLesson && setActiveLessonId(nextLesson.id)}
          disabled={!nextLesson}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-xl border border-border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition shrink-0"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

