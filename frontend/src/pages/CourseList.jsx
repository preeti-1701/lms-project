import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const safeArray = (data) => Array.isArray(data) ? data : (data?.results || [])

export default function CourseList() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const { user } = useAuth()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses/')
      setCourses(safeArray(res.data))
    } catch (err) {
      setError('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
      (course.description || '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleEnroll = async (courseId) => {
    try {
      await api.post('/enrollments/enrollments/', { course: courseId, student: user.id })
      alert('Enrolled successfully!')
      fetchCourses()
    } catch (err) {
      alert(err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Enrollment failed')
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-text mb-6">Courses</h1>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
      )}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'upcoming'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition ${
                statusFilter === s
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text-muted border border-border hover:text-primary'
              }`}
            >
              {s === 'all' ? 'All' : s === 'active' ? 'Active' : 'Upcoming'}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            userRole={user?.role}
            onEnroll={handleEnroll}
          />
        ))}
      </div>
      {filteredCourses.length === 0 && (
        <div className="text-center py-12 text-text-muted bg-surface rounded-2xl border border-border">
          <p className="text-lg">No courses found</p>
          <p className="mt-1 text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}

function CourseCard({ course, userRole, onEnroll }) {
  const statusColors = {
    active: 'bg-green-100 text-green-700',
    upcoming: 'bg-amber-100 text-amber-700',
  }

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden hover:shadow-md transition">
      <div className="h-32 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
        <span className="text-4xl font-bold text-primary/30">{course.course_id?.slice(0, 2)}</span>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[course.status] || 'bg-gray-100 text-gray-600'}`}>
            {course.status === 'active' ? 'Active' : 'Upcoming'}
          </span>
          <span className="text-xs text-text-muted">{course.duration}h</span>
        </div>
        <h3 className="text-lg font-semibold text-text mb-1">{course.title}</h3>
        <p className="text-sm text-text-muted line-clamp-2 mb-3">{course.description || 'No description'}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">By {course.trainer_name || 'Unknown'}</span>
          <div className="flex gap-2">
            {userRole === 'student' && (
              <button
                onClick={() => onEnroll(course.id)}
                className="px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition"
              >
                Enroll
              </button>
            )}
            <Link
              to={`/courses/${course.id}`}
              className="px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

