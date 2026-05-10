import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { getMyCoursesApi } from '../../api/courses.api'

const StudentDashboard = () => {
  const { user, logout } = useAuth()
  const [selectedCourse, setSelectedCourse] = useState(null)

  const { data: courses, isLoading } = useQuery({
    queryKey: ['my-courses'],
    queryFn: () => getMyCoursesApi().then(r => r.data)
  })

  const videos = selectedCourse?.videos || []

  const handleVideoClick = (video) => {
    window.open(`https://www.youtube.com/watch?v=${video.youtube_video_id}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">LMS Student Portal</h1>
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

        {/* Course List */}
        <div className="w-72 shrink-0">
          <h2 className="text-lg font-bold text-gray-800 mb-4">My Courses</h2>
          {isLoading && (
            <p className="text-gray-500 text-sm">Loading courses...</p>
          )}
          {!isLoading && courses?.length === 0 && (
            <p className="text-gray-500 text-sm">No courses assigned yet.</p>
          )}
          <div className="space-y-3">
            {courses?.map(course => (
              <div
                key={course.id}
                onClick={() => setSelectedCourse(course)}
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

        {/* Right Section */}
        <div className="flex-1">

          {!selectedCourse && (
            <div className="bg-white rounded-xl shadow p-10 text-center text-gray-400">
              <p className="text-lg">Select a course to start learning</p>
            </div>
          )}

          {selectedCourse && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                {selectedCourse.title}
              </h2>

              {videos.length === 0 && (
                <p className="text-gray-500 text-sm">No videos in this course yet.</p>
              )}

              <div className="space-y-3">
                {videos.map(video => (
                  <div
                    key={video.id}
                    onClick={() => handleVideoClick(video)}
                    className="bg-white rounded-xl p-4 shadow cursor-pointer hover:shadow-md transition flex items-center gap-4"
                  >
                    <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shrink-0">
                      {video.order}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">
                        {video.title}
                      </h3>
                    </div>
                    <div className="ml-auto text-blue-500 text-sm font-medium">
                      ▶ Play
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default StudentDashboard