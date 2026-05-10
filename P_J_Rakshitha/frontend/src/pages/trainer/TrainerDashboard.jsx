import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { getTrainerCoursesApi, getCourseProgressApi } from '../../api/courses.api'

const TrainerDashboard = () => {
  const { user, logout } = useAuth()
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)

  const { data: courses, isLoading } = useQuery({
    queryKey: ['trainer-courses'],
    queryFn: () => getTrainerCoursesApi().then(r => r.data)
  })

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['course-progress', selectedCourse?.id],
    queryFn: () => getCourseProgressApi(selectedCourse.id).then(r => r.data),
    enabled: !!selectedCourse
  })

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">LMS Trainer Portal</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">Welcome, {user?.full_name}</span>
          <button
            onClick={logout}
            className="bg-white text-blue-600 px-4 py-1 rounded-lg text-sm font-semibold hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="p-6 flex gap-6">

        {/* Left — Course list */}
        <div className="w-72 shrink-0">
          <h2 className="text-lg font-bold text-gray-800 mb-4">My Courses</h2>

          {isLoading && (
            <p className="text-gray-500 text-sm">Loading courses...</p>
          )}
          {!isLoading && (!courses || courses.length === 0) && (
            <div className="bg-white rounded-xl p-4 shadow text-center">
              <p className="text-gray-500 text-sm">No courses assigned yet.</p>
              <p className="text-gray-400 text-xs mt-1">Contact admin to get assigned to a course.</p>
            </div>
          )}

          <div className="space-y-3">
            {courses?.map(course => (
              <div
                key={course.id}
                onClick={() => {
                  setSelectedCourse(course)
                  setSelectedStudent(null)
                }}
                className={`bg-white rounded-xl p-4 shadow cursor-pointer hover:shadow-md transition border-2 ${
                  selectedCourse?.id === course.id
                    ? 'border-blue-500'
                    : 'border-transparent'
                }`}
              >
                <h3 className="font-semibold text-gray-800 text-sm">{course.title}</h3>
                <p className="text-gray-500 text-xs mt-1">{course.description}</p>
                <p className="text-blue-500 text-xs mt-2">
                  {course.videos?.length || 0} videos
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Student progress */}
        <div className="flex-1">

          {!selectedCourse && (
            <div className="bg-white rounded-xl shadow p-10 text-center text-gray-400">
              <p className="text-lg">Select a course to view student progress</p>
            </div>
          )}

          {selectedCourse && (
            <div>
              <div className="bg-white rounded-xl shadow p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800">{selectedCourse.title}</h2>
                <p className="text-gray-500 text-sm mt-1">{selectedCourse.description}</p>
                <p className="text-gray-400 text-xs mt-2">
                  {selectedCourse.videos?.length || 0} total videos
                </p>
              </div>

              {progressLoading && (
                <div className="text-center py-10 text-gray-500">Loading student progress...</div>
              )}

              {!progressLoading && progress?.length === 0 && (
                <div className="bg-white rounded-xl shadow p-6 text-center text-gray-400">
                  <p>No students enrolled in this course yet.</p>
                </div>
              )}

              {!progressLoading && progress?.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-700 mb-4">
                    Enrolled Students ({progress.length})
                  </h3>

                  <div className="space-y-4">
                    {progress.map(student => (
                      <div key={student.student_id} className="bg-white rounded-xl shadow p-6">

                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-800">{student.student_name}</h4>
                            <p className="text-gray-500 text-sm">{student.student_email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">{student.percentage}%</p>
                            <p className="text-gray-400 text-xs">
                              {student.watched_videos} of {student.total_videos} videos watched
                            </p>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${student.percentage}%` }}
                          />
                        </div>

                        {/* Video breakdown */}
                        <button
                          onClick={() => setSelectedStudent(
                            selectedStudent?.student_id === student.student_id ? null : student
                          )}
                          className="text-blue-600 text-sm font-medium hover:underline"
                        >
                          {selectedStudent?.student_id === student.student_id
                            ? 'Hide details'
                            : 'View video details'}
                        </button>

                        {selectedStudent?.student_id === student.student_id && (
                          <div className="mt-4 space-y-2">
                            {student.videos.map(video => (
                              <div
                                key={video.id}
                                className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                              >
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                  video.watched
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-gray-200 text-gray-400'
                                }`}>
                                  {video.watched ? '✓' : '○'}
                                </div>
                                <span className="text-sm text-gray-700">{video.title}</span>
                                <span className={`ml-auto text-xs font-medium ${
                                  video.watched ? 'text-green-600' : 'text-gray-400'
                                }`}>
                                  {video.watched ? 'Watched' : 'Not watched'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TrainerDashboard