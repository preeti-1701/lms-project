import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CourseView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchCourseData = async () => {
    try {
      const [courseRes, videosRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/courses/${id}/videos`)
      ]);
      setCourse(courseRes.data);
      setVideos(videosRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const handleAddVideo = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await api.post(`/courses/${id}/videos`, {
        title: videoTitle,
        youtube_url: videoUrl,
        order_index: videos.length + 1
      });
      setVideoTitle('');
      setVideoUrl('');
      setShowAddVideo(false);
      fetchCourseData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add video');
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium">Loading course content...</p>
    </div>
  );
  
  if (error) return <div className="text-center py-20 text-red-600 font-bold">{error}</div>;
  if (!course) return <div className="text-center py-20">Course not found</div>;

  return (
    <div className="animate-fade-in space-y-8">
      {/* Course Banner */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-widest">Course Module</span>
              </div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">{course.title}</h1>
              <p className="text-slate-500 text-lg leading-relaxed max-w-3xl mb-8">{course.description}</p>
              
              <div className="flex flex-wrap gap-8 items-center text-sm font-medium text-slate-400">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    {course.created_by_name?.charAt(0) || 'A'}
                  </div>
                  <span className="text-slate-900 font-bold">Instructor: {course.created_by_name || 'Admin'}</span>
                </div>
                <div className="w-px h-4 bg-slate-200"></div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-900 font-bold">{videos.length} Lessons</span>
                </div>
              </div>
            </div>
            
            {user.role === 'student' && !course.isEnrolled && (
              <button 
                onClick={async () => {
                  try {
                    await api.post(`/courses/enroll/${id}`);
                    fetchCourseData();
                  } catch (err) {
                    alert('Enrollment failed');
                  }
                }}
                className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
              >
                Enroll in this Course
              </button>
            )}

            {(user.role === 'admin' || user.role === 'trainer') && (
              <button 
                onClick={() => setShowAddVideo(!showAddVideo)}
                className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm ${
                  showAddVideo 
                    ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50' 
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {showAddVideo ? 'Cancel Action' : 'Add New Lesson'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Video Form */}
      {showAddVideo && (
        <div className="bg-white p-10 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold">
              +
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Add Day {videos.length + 1} Lesson</h3>
          </div>
          <form onSubmit={handleAddVideo} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lesson Title</label>
              <input 
                type="text" required value={videoTitle} 
                onChange={e => setVideoTitle(e.target.value)} 
                className="input-simple"
                placeholder="e.g. Introduction to React"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">YouTube URL</label>
              <input 
                type="url" required value={videoUrl} 
                onChange={e => setVideoUrl(e.target.value)} 
                className="input-simple"
                placeholder="https://youtube.com/..."
              />
            </div>
            <div className="md:col-span-2">
              <button 
                type="submit" disabled={isAdding}
                className="btn-primary-simple w-full md:w-auto px-10 h-12"
              >
                {isAdding ? 'Processing...' : `Save Day ${videos.length + 1} Lesson`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Video List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Curriculum Structure</h2>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">Locked sequence</span>
        </div>

        {videos.length === 0 ? (
          <div className="bg-slate-50 rounded-xl p-16 text-center border border-slate-100">
            <p className="text-slate-400 font-medium italic">The curriculum is currently empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {videos.map((video, index) => {
              const content = (
                <>
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center transition-all ${
                    !course.isEnrolled && user.role === 'student'
                      ? 'bg-slate-100 text-slate-300'
                      : 'bg-slate-50 group-hover:bg-slate-900 text-slate-400 group-hover:text-white'
                  }`}>
                    <span className="text-[10px] font-bold uppercase tracking-tight leading-none mb-1">Day</span>
                    <span className="text-xl font-bold leading-none">{index + 1}</span>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-slate-900">
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Video Lesson</span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {!course.isEnrolled && user.role === 'student' ? 'Enroll to unlock' : 'Required'}
                      </span>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    !course.isEnrolled && user.role === 'student'
                      ? 'bg-slate-50 text-slate-200'
                      : 'bg-slate-50 group-hover:bg-slate-900 text-slate-300 group-hover:text-white'
                  }`}>
                    {!course.isEnrolled && user.role === 'student' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </div>
                </>
              );

              return !course.isEnrolled && user.role === 'student' ? (
                <div 
                  key={video.id} 
                  onClick={() => alert('Please enroll in the course to access lessons.')}
                  className="flex items-center gap-6 p-6 bg-slate-50/50 border border-slate-100 rounded-xl cursor-not-allowed grayscale-[0.5]"
                >
                  {content}
                </div>
              ) : (
                <Link 
                  key={video.id} 
                  to={`/course/${course.id}/video/${video.id}`}
                  className="group flex items-center gap-6 p-6 bg-white border border-slate-200 rounded-xl hover:border-slate-900 transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  {content}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseView;
