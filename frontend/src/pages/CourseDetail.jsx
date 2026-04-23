import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCourse } from '../api/courses'
import { enroll } from '../api/enrollment'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import ErrorAlert from '../components/ErrorAlert'
import Button from '../components/Button'

export default function CourseDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    getCourse(slug)
      .then(res => setCourse(res.data))
      .catch(() => setError('Course not found.'))
      .finally(() => setLoading(false))
  }, [slug])

  const handleEnroll = async () => {
    if (!user) return navigate('/login')
    setEnrolling(true)
    setError('')
    try {
      await enroll(course.id)
      setSuccess('Enrolled successfully! Go to your dashboard to start learning.')
    } catch (err) {
      setError(err.response?.data?.error || 'Enrollment failed.')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) return <Layout><div className="text-center py-20 text-gray-500">Loading...</div></Layout>
  if (!course) return <Layout><ErrorAlert message={error} /></Layout>

  return (
    <Layout>
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full capitalize">
            {course.level}
          </span>
          {course.category_name && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {course.category_name}
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">{course.title}</h1>
        <p className="text-gray-500 mb-1">by {course.instructor}</p>
        <p className="text-gray-600 mt-4 mb-6">{course.description}</p>

        <ErrorAlert message={error} />
        {success && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        {user?.role === 'student' && (
          <div className="mb-8">
            <Button loading={enrolling} loadingText="Enrolling...">
              <span onClick={handleEnroll}>
                {course.price === '0.00' ? 'Enroll for Free' : `Enroll for $${course.price}`}
              </span>
            </Button>
          </div>
        )}

        {/* Lessons list */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Lessons ({course.lessons?.length || 0})
          </h2>
          {course.lessons?.length === 0 ? (
            <p className="text-gray-500">No lessons yet.</p>
          ) : (
            <div className="space-y-3">
              {course.lessons?.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg px-5 py-4"
                >
                  <span className="text-sm font-bold text-gray-400 w-6">{index + 1}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{lesson.title}</p>
                    {lesson.description && (
                      <p className="text-sm text-gray-500">{lesson.description}</p>
                    )}
                  </div>
                  {lesson.is_preview && (
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                      Free preview
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}