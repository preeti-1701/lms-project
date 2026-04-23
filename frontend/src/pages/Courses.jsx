import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCourses } from '../api/courses'
import Layout from '../components/Layout'
import ErrorAlert from '../components/ErrorAlert'

function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course.slug}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-5">
        {course.thumbnail && (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-40 object-cover rounded-lg mb-4"
          />
        )}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full capitalize">
            {course.level}
          </span>
          {course.category_name && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {course.category_name}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-gray-800 text-lg mb-1">{course.title}</h3>
        <p className="text-sm text-gray-500 mb-3">by {course.instructor}</p>
        <div className="flex items-center justify-between">
          <span className="text-blue-600 font-bold">
            {course.price === '0.00' ? 'Free' : `$${course.price}`}
          </span>
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
    getCourses()
      .then(res => setCourses(res.data))
      .catch(() => setError('Failed to load courses.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">All Courses</h1>
        <p className="text-gray-500 mt-1">Browse and enroll in available courses</p>
      </div>

      <ErrorAlert message={error} />

      {loading ? (
        <div className="text-center text-gray-500 py-20">Loading courses...</div>
      ) : courses.length === 0 ? (
        <div className="text-center text-gray-500 py-20">No courses available yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </Layout>
  )
}