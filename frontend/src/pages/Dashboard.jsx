import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"
import {
  Play, BookOpen, Award, Clock, TrendingUp, Users, DollarSign, Star,
  ChevronRight, BarChart3, MoreHorizontal, CheckCircle2, Circle,
  GraduationCap, MonitorPlay, ShieldAlert
} from "lucide-react"

const safeArray = (data) => Array.isArray(data) ? data : (data?.results || [])

function CircularProgress({ percent, size = 80, stroke = 8 }) {
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
      <span className="absolute text-sm font-bold text-text">{percent}%</span>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, trend, color }) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  }
  return (
    <div className="bg-white rounded-2xl border border-border p-5 hover:shadow-sm transition">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${colorMap[color] || colorMap.indigo}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{trend}</span>}
      </div>
      <p className="mt-3 text-2xl font-bold text-text">{value}</p>
      <p className="text-sm text-text-muted">{label}</p>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const renderRoleDashboard = () => {
    switch (user?.role) {
      case "admin": return <AdminDashboard />
      case "trainer": return <TrainerDashboard />
      default: return <StudentDashboard />
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text">Dashboard</h1>
        <p className="text-text-muted mt-1">
          Welcome back, <span className="font-medium text-text">{user?.first_name || user?.username}</span>
        </p>
      </div>
      {renderRoleDashboard()}
    </div>
  )
}

function StudentDashboard() {
  const [courses, setCourses] = useState([])
  const [progress, setProgress] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, pRes, eRes] = await Promise.all([api.get("/courses/"), api.get("/progress/"), api.get("/enrollments/enrollments/")])
        setCourses(safeArray(cRes.data))
        setProgress(safeArray(pRes.data))
        setEnrollments(safeArray(eRes.data))
      } catch { /* ignore */ } finally { setLoading(false) }
    }
    fetchData()
  }, [])

  const enrolledCourses = courses.filter(c => enrollments.some(e => e.course === c.id))
  const totalLessons = enrolledCourses.reduce((sum, c) => sum + (c.lessons?.length || 0), 0)
  const completedLessons = progress.filter(p => p.is_completed).length
  const overallPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  const continueCourse = enrolledCourses.find(c => {
    const lessons = c.lessons || []
    const completedIds = progress.filter(p => p.is_completed).map(p => p.lesson)
    return lessons.some(l => !completedIds.includes(l.id))
  })

  const continueLesson = continueCourse ? (() => {
    const lessons = continueCourse.lessons || []
    const completedIds = progress.filter(p => p.is_completed).map(p => p.lesson)
    return lessons.find(l => !completedIds.includes(l.id)) || lessons[0]
  })() : null

  const courseProgress = (course) => {
    const lessons = course.lessons || []
    if (!lessons.length) return 0
    const completedIds = progress.filter(p => p.is_completed).map(p => p.lesson)
    const done = lessons.filter(l => completedIds.includes(l.id)).length
    return Math.round((done / lessons.length) * 100)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-8">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Courses Enrolled" value={enrolledCourses.length} color="indigo" />
        <StatCard icon={CheckCircle2} label="Lessons Completed" value={completedLessons} color="emerald" />
        <StatCard icon={Clock} label="Hours Spent" value={Math.round(completedLessons * 0.5)} color="amber" />
        <StatCard icon={Award} label="Certificates" value={0} color="rose" />
      </div>

      {/* Welcome + Overall Progress */}
      <div className="bg-white rounded-2xl border border-border p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-text">Keep up the great work!</h2>
          <p className="text-text-muted mt-2">You have completed {completedLessons} out of {totalLessons} lessons across all your enrolled courses.</p>
          <div className="mt-4 flex items-center gap-4">
            <Link to="/courses" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition">
              Browse Courses <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <CircularProgress percent={overallPercent} size={100} stroke={10} />
          <span className="text-sm font-medium text-text-muted">Overall Progress</span>
        </div>
      </div>

      {/* Continue Learning */}
      {continueCourse && continueLesson && (
        <div className="bg-primary-light/50 rounded-2xl border border-primary/20 p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wide">Continue Learning</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-text">{continueCourse.title}</h3>
              <p className="text-sm text-text-muted mt-1">Next: {continueLesson.title}</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${courseProgress(continueCourse)}%` }} />
                </div>
                <span className="text-xs font-medium text-text-muted">{courseProgress(continueCourse)}%</span>
              </div>
            </div>
            <Link to={`/courses/${continueCourse.id}`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition shrink-0">
              <Play className="w-4 h-4" /> Resume
            </Link>
          </div>
        </div>
      )}

      {/* Enrolled Courses Grid */}
      <div>
        <h3 className="text-lg font-bold text-text mb-4">My Courses</h3>
        {enrolledCourses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-8 text-center">
            <BookOpen className="w-10 h-10 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted">No enrolled courses yet.</p>
            <Link to="/courses" className="inline-block mt-3 text-primary font-medium hover:underline">Browse Courses</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-sm transition group">
                <div className="h-32 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-primary/30" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-light text-primary">{course.status || "Active"}</span>
                    <span className="text-xs text-text-muted flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {course.trainer_name}</span>
                  </div>
                  <h4 className="font-semibold text-text mb-1 group-hover:text-primary transition">{course.title}</h4>
                  <p className="text-sm text-text-muted line-clamp-2 mb-3">{course.description || "No description"}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${courseProgress(course)}%` }} />
                    </div>
                    <span className="text-xs font-medium text-text-muted">{courseProgress(course)}%</span>
                  </div>
                  <Link to={`/courses/${course.id}`} className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary hover:underline">
                    Continue <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TrainerDashboard() {
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, eRes] = await Promise.all([api.get("/courses/"), api.get("/enrollments/enrollments/")])
        setCourses(safeArray(cRes.data))
        setEnrollments(safeArray(eRes.data))
      } catch { /* ignore */ } finally { setLoading(false) }
    }
    fetchData()
  }, [])

  const myCourses = courses
  const totalStudents = enrollments.filter(e => myCourses.some(c => c.id === e.course)).length
  const activeCourses = myCourses.filter(c => c.status === "active").length
  const avgRating = 4.7
  const earnings = totalStudents * 49

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={totalStudents} trend="+12%" color="indigo" />
        <StatCard icon={BookOpen} label="Active Courses" value={activeCourses} color="emerald" />
        <StatCard icon={DollarSign} label="Total Earnings" value={`$${earnings}`} trend="+8%" color="amber" />
        <StatCard icon={Star} label="Avg. Rating" value={avgRating} color="rose" />
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-bold text-text">Manage Courses</h3>
          <button className="text-sm text-primary font-medium hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-text-muted uppercase text-xs">
              <tr>
                <th className="px-6 py-3 font-medium">Course</th>
                <th className="px-6 py-3 font-medium">Students</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Rating</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {myCourses.map((course) => {
                const students = enrollments.filter(e => e.course === course.id).length
                return (
                  <tr key={course.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-text">{course.title}</td>
                    <td className="px-6 py-4 text-text-muted">{students}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${course.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                        {course.status === "active" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-muted flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> 4.7</td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/courses/${course.id}`} className="text-primary font-medium hover:underline">Edit</Link>
                    </td>
                  </tr>
                )
              })}
              {myCourses.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-text-muted">No courses yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function AdminDashboard() {
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, eRes] = await Promise.all([api.get("/courses/"), api.get("/enrollments/enrollments/")])
        setCourses(safeArray(cRes.data))
        setEnrollments(safeArray(eRes.data))
      } catch { /* ignore */ } finally { setLoading(false) }
    }
    fetchData()
  }, [])

  const totalStudents = enrollments.length
  const totalCourses = courses.length
  const activeCourses = courses.filter(c => c.status === "active").length

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={totalStudents} color="indigo" />
        <StatCard icon={BookOpen} label="Total Courses" value={totalCourses} color="emerald" />
        <StatCard icon={MonitorPlay} label="Active Courses" value={activeCourses} color="amber" />
        <StatCard icon={ShieldAlert} label="Pending Reviews" value={0} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-lg font-bold text-text mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/courses" className="p-4 rounded-xl bg-primary-light text-primary font-medium text-center hover:bg-primary/20 transition">Manage Courses</Link>
            <div className="p-4 rounded-xl bg-slate-50 text-text-muted font-medium text-center cursor-not-allowed">User Management</div>
            <div className="p-4 rounded-xl bg-slate-50 text-text-muted font-medium text-center cursor-not-allowed">Reports</div>
            <div className="p-4 rounded-xl bg-slate-50 text-text-muted font-medium text-center cursor-not-allowed">Settings</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-lg font-bold text-text mb-4">Platform Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Course Completion Rate</span>
              <span className="font-medium text-text">68%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: "68%" }} /></div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Student Satisfaction</span>
              <span className="font-medium text-text">4.7/5</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: "94%" }} /></div>
          </div>
        </div>
      </div>
    </div>
  )
}