import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Header from '../components/Header'

function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course.slug}`}>
      <div className="relative bg-white/80 backdrop-blur-sm border border-white/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer hover:-translate-y-1">

        {/* Gradient Glow on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-br from-tan/10 via-transparent to-crimson/10" />

        {/* Thumbnail */}
        <div className="h-52 bg-gradient-to-br from-[#1e3231] to-[#2a4544] flex items-center justify-center">
          <span className="text-white text-3xl font-bold opacity-90 tracking-wide">
            {course.title.charAt(0)}
          </span>
        </div>

        {/* Content */}
        <div className="p-6 relative">

          {/* Badges */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold bg-tan/30 text-jet px-3 py-1 rounded-full capitalize">
              {course.level}
            </span>
            {course.category_name && (
              <span className="text-xs text-jet/60">
                {course.category_name}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-jet mb-2 group-hover:text-crimson transition-colors">
            {course.title}
          </h3>

          {/* Instructor */}
          <p className="text-sm text-jet/60 mb-5">
            by <span className="text-jet font-medium">{course.instructor}</span>
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-xl font-bold text-crimson">
              {course.price === '0.00' ? 'Free' : `$${course.price}`}
            </span>

            <span className="text-sm font-semibold text-jet/70 group-hover:text-crimson flex items-center gap-1 transition">
              View
              <span className="transform group-hover:translate-x-1 transition">→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/courses/')
      .then(res => setCourses(res.data))
      .catch(() => setError('Failed to load courses.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Header />

      <main className="relative min-h-screen overflow-hidden bg-[#f9fafb]">

        {/* MESH BACKGROUND */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(222,185,134,0.12),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(147,22,33,0.08),transparent_40%)]"></div>

        {/* GLOW BLOBS */}
        <div className="absolute top-[-120px] left-[-120px] w-[420px] h-[420px] bg-tan/20 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-[-140px] right-[-140px] w-[420px] h-[420px] bg-crimson/10 rounded-full blur-3xl opacity-40"></div>

        {/* CENTER SOFT GLOW */}
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-tan/10 rounded-full blur-3xl opacity-30"></div>

        {/* CONTENT */}
        <div className="relative max-w-7xl mx-auto px-6 py-16">

          {/* Header */}
          <div className="mb-16 max-w-2xl">
            <h1 className="text-5xl font-bold text-jet mb-4 leading-tight">
              Explore Courses
            </h1>
            <p className="text-lg text-jet/60">
              Discover high-quality content and learn at your own pace.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-300 rounded-xl">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center py-32">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-tan rounded-full animate-spin"></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-32">
              <p className="text-jet/60 text-lg">No courses available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {courses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}

        </div>
      </main>
    </>
  )
}