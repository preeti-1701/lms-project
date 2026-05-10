import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCoursesApi, createCourseApi, addVideoApi, assignCourseApi } from '../../api/courses.api'
import { getUsersApi } from '../../api/auth.api'

const CourseManagement = () => {
  const queryClient = useQueryClient()
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [courseForm, setCourseForm] = useState({ title: '', description: '' })
  const [videoForm, setVideoForm] = useState({ title: '', youtube_video_id: '', order: 1 })
  const [assignForm, setAssignForm] = useState({ student: '' })

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => getCoursesApi().then(r => r.data)
  })

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsersApi().then(r => r.data)
  })

  const createCourseMutation = useMutation({
    mutationFn: createCourseApi,
    onSuccess: () => {
      queryClient.invalidateQueries(['courses'])
      setShowCourseForm(false)
      setCourseForm({ title: '', description: '' })
    }
  })

  const addVideoMutation = useMutation({
    mutationFn: ({ courseId, data }) => addVideoApi(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['courses'])
      setVideoForm({ title: '', youtube_video_id: '', order: 1 })
    }
  })

  const assignMutation = useMutation({
    mutationFn: assignCourseApi,
    onSuccess: () => {
      queryClient.invalidateQueries(['courses'])
      setAssignForm({ student: '' })
    }
  })

  const students = users?.filter(u => u.role === 'student') || []

  if (isLoading) return <div className="text-center py-10 text-gray-500">Loading courses...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Courses</h2>
        <button
          onClick={() => setShowCourseForm(!showCourseForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          + Add Course
        </button>
      </div>

      {/* Add Course Form */}
      {showCourseForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">Create New Course</h3>
          <form onSubmit={(e) => { e.preventDefault(); createCourseMutation.mutate(courseForm) }}
            className="space-y-3">
            <input
              type="text"
              placeholder="Course Title"
              required
              value={courseForm.title}
              onChange={e => setCourseForm({...courseForm, title: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Description"
              value={courseForm.description}
              onChange={e => setCourseForm({...courseForm, description: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <div className="flex gap-3">
              <button type="submit"
                disabled={createCourseMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                {createCourseMutation.isPending ? 'Creating...' : 'Create Course'}
              </button>
              <button type="button" onClick={() => setShowCourseForm(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Courses List */}
      <div className="grid gap-4">
        {courses?.map(course => (
          <div key={course.id} className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{course.title}</h3>
                <p className="text-gray-500 text-sm mt-1">{course.description}</p>
                <p className="text-gray-400 text-xs mt-1">{course.videos?.length || 0} videos</p>
              </div>
              <button
                onClick={() => setSelectedCourse(selectedCourse?.id === course.id ? null : course)}
                className="text-blue-600 text-sm font-semibold hover:underline"
              >
                {selectedCourse?.id === course.id ? 'Close' : 'Manage'}
              </button>
            </div>

            {selectedCourse?.id === course.id && (
              <div className="border-t pt-4 grid grid-cols-2 gap-6">

                {/* Add Video */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Add Video</h4>
                  <div className="space-y-2">
                    <input type="text" placeholder="Video Title"
                      value={videoForm.title}
                      onChange={e => setVideoForm({...videoForm, title: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input type="text" placeholder="YouTube Video ID (e.g. kqtD5dpn9C8)"
                      value={videoForm.youtube_video_id}
                      onChange={e => setVideoForm({...videoForm, youtube_video_id: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input type="number" placeholder="Order"
                      value={videoForm.order}
                      onChange={e => setVideoForm({...videoForm, order: parseInt(e.target.value)})}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => addVideoMutation.mutate({ courseId: course.id, data: videoForm })}
                      disabled={addVideoMutation.isPending}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                      {addVideoMutation.isPending ? 'Adding...' : 'Add Video'}
                    </button>
                  </div>

                  {/* Video list */}
                  <div className="mt-4 space-y-2">
                    {course.videos?.map(v => (
                      <div key={v.id} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                        <span className="text-gray-400">#{v.order}</span>
                        <span>{v.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assign Student */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Assign Student</h4>
                  <div className="space-y-2">
                    <select
                      value={assignForm.student}
                      onChange={e => setAssignForm({...assignForm, student: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a student</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>
                      ))}
                    </select>
                    <button
                      onClick={() => assignMutation.mutate({
                        course: course.id,
                        student: assignForm.student
                      })}
                      disabled={!assignForm.student || assignMutation.isPending}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                    >
                      {assignMutation.isPending ? 'Assigning...' : 'Assign Student'}
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CourseManagement