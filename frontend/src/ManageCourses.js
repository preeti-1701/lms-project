import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

function ManageCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/api/all-courses/');
      setCourses(res.data);
    } catch (error) {
      console.error('Error loading courses', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleArchive = async (id) => {
    const confirmed = window.confirm('Archive this course?');
    if (!confirmed) return;

    try {
      await api.post(`/api/archive-course/${id}/`);
      alert('Course archived');
      fetchCourses();
    } catch (error) {
      console.error(error);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/admin');
  };

  const CourseCard = ({ course }) => (
    <div className="group relative bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 hover:border-cyan-400/30 hover:bg-slate-900/60 transition-all duration-300">
      {/* Gradient background accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/10 to-blue-400/10 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
          {course.title}
        </h3>

        <p className="text-slate-300 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        <div className="space-y-2 mb-4 text-sm">
          <p className="text-slate-400">
            <span className="text-cyan-400 font-semibold">Category:</span>{' '}
            <span className="text-slate-300">{course.category}</span>
          </p>
          <p className="text-slate-400">
            <span className="text-cyan-400 font-semibold">Level:</span>{' '}
            <span className="text-slate-300">{course.level}</span>
          </p>
          <p className="text-slate-400">
            <span className="text-cyan-400 font-semibold">Duration:</span>{' '}
            <span className="text-slate-300">{course.duration}</span>
          </p>
          <p className="text-slate-400">
            <span className="text-cyan-400 font-semibold">Videos:</span>{' '}
            <span className="text-slate-300">{course.videos_count}</span>
          </p>
          <p className="text-slate-400">
            <span className="text-cyan-400 font-semibold">Created By:</span>{' '}
            <span className="text-slate-300">{course.trainer}</span>
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() =>
              navigate('/create-course', {
                state: {
                  editMode: true,
                  course: course,
                },
              })
            }
            className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => handleArchive(course.id)}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 text-sm"
          >
            Archive
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent opacity-30 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 px-8 md:px-12 py-10">
        {/* Back button */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="px-4 py-2 text-slate-300 hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2"
          >
            ← Back
          </button>
        </div>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
              Manage Courses
            </span>
          </h1>
          <p className="text-slate-400 text-lg">
            View and edit all created courses
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-900/40 backdrop-blur-xl border border-white/10 mb-4">
                <div className="w-8 h-8 border-4 border-slate-600 border-t-cyan-400 rounded-full animate-spin" />
              </div>
              <p className="text-slate-300">Loading courses...</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && courses.length === 0 && (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <p className="text-slate-400 text-lg">No courses available.</p>
            </div>
          </div>
        )}

        {/* Courses grid */}
        {!loading && courses.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ManageCourses;