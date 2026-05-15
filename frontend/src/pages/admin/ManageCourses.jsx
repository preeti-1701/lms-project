import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });

  // Curriculum State
  const [showVideosModal, setShowVideosModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [videoForm, setVideoForm] = useState({ title: '', youtube_url: '', order_index: 0 });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data);
    } catch (err) {
      setError('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg, type = 'success') => {
    if (type === 'success') setSuccess(msg);
    else setError(msg);
    setTimeout(() => {
      setSuccess('');
      setError('');
    }, 4000);
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await api.post('/courses', formData);
      setFormData({ title: '', description: '' });
      setShowAddForm(false);
      fetchCourses();
      showNotification('Course created successfully');
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to create course', 'error');
    }
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm('Are you sure you want to delete this course and all its videos?')) {
      try {
        await api.delete(`/courses/${id}`);
        fetchCourses();
        showNotification('Course deleted successfully');
      } catch (err) {
        showNotification('Failed to delete course', 'error');
      }
    }
  };

  // Video/Curriculum Management
  const openCurriculum = async (course) => {
    setSelectedCourse(course);
    try {
      const res = await api.get(`/courses/${course.id}/videos`);
      setVideos(res.data);
      setShowVideosModal(true);
    } catch (err) {
      showNotification('Failed to fetch course videos', 'error');
    }
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/courses/${selectedCourse.id}/videos`, videoForm);
      setVideoForm({ title: '', youtube_url: '', order_index: videos.length + 1 });
      const res = await api.get(`/courses/${selectedCourse.id}/videos`);
      setVideos(res.data);
      showNotification('Video added to curriculum');
    } catch (err) {
      showNotification('Failed to add video', 'error');
    }
  };

  const handleDeleteVideo = async (id) => {
    if (window.confirm('Remove this video from the course?')) {
      try {
        await api.delete(`/videos/${id}`);
        const res = await api.get(`/courses/${selectedCourse.id}/videos`);
        setVideos(res.data);
        showNotification('Video removed');
      } catch (err) {
        showNotification('Failed to delete video', 'error');
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Knowledge Base...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Curriculum Control</h1>
          <p className="text-slate-500 font-medium mt-1">Design courses and upload secure video content</p>
        </div>
        <div className="flex gap-3">
          <div className="relative group flex-grow md:flex-grow-0">
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search curricula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-80 pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all shadow-sm"
            />
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${
              showAddForm 
              ? 'bg-white text-slate-900 border border-slate-200' 
              : 'bg-slate-900 text-white hover:bg-black'
            }`}
          >
            {showAddForm ? 'Close Designer' : 'Design New Course'}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold border border-red-100 flex items-center gap-3 animate-slide-up">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
        {error}
      </div>}
      
      {success && <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl mb-6 text-sm font-bold border border-emerald-100 flex items-center gap-3 animate-slide-up">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
        {success}
      </div>}

      {showAddForm && (
        <div className="bg-white p-8 rounded-2xl shadow-soft border border-slate-200 mb-8 animate-slide-down">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Course Blueprint</h2>
          <form onSubmit={handleCreateCourse} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Course Title</label>
              <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="input-simple" placeholder="e.g. Advanced System Architecture" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
              <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3" className="input-simple min-h-[100px]" placeholder="Outline what students will learn..."></textarea>
            </div>
            <button type="submit" className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-md">Deploy Course</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-white p-8 rounded-[2rem] shadow-soft border border-slate-100 hover:border-slate-300 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{course.title}</h3>
                <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-wider text-[10px]">Instructor: {course.created_by_name || 'Admin'}</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openCurriculum(course)} className="p-2 bg-slate-50 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title="Manage Curriculum">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </button>
                <button onClick={() => handleDeleteCourse(course.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete Course">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
            <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed mb-6">{course.description}</p>
            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Added {new Date(course.created_at).toLocaleDateString()}</span>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md">
                  <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  <span className="text-[10px] font-black text-slate-600">{course.enrollment_count || 0} Students</span>
                </div>
              </div>
              <button onClick={() => openCurriculum(course)} className="text-xs font-bold text-primary-600 hover:underline">Edit Curriculum &rarr;</button>
            </div>
          </div>
        ))}
      </div>

      {/* Videos/Curriculum Modal */}
      {showVideosModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Curriculum Builder</h2>
                <p className="text-slate-500 font-medium">Managing videos for: <span className="text-slate-900">{selectedCourse?.title}</span></p>
              </div>
              <button onClick={() => setShowVideosModal(false)} className="p-3 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-2xl transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Add Video Form */}
              <div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Add New Lesson</h3>
                <form onSubmit={handleAddVideo} className="space-y-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Lesson Title</label>
                    <input type="text" required value={videoForm.title} onChange={e => setVideoForm({...videoForm, title: e.target.value})} className="input-simple bg-white" placeholder="Module 1: Introduction" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">YouTube URL</label>
                    <input type="url" required value={videoForm.youtube_url} onChange={e => setVideoForm({...videoForm, youtube_url: e.target.value})} className="input-simple bg-white" placeholder="https://youtube.com/watch?v=..." />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Order Index</label>
                    <input type="number" required value={videoForm.order_index} onChange={e => setVideoForm({...videoForm, order_index: e.target.value})} className="input-simple bg-white" />
                  </div>
                  <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">Add to Curriculum</button>
                </form>
              </div>

              {/* Current Videos List */}
              <div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Current Lessons ({videos.length})</h3>
                <div className="space-y-4">
                  {videos.length === 0 ? (
                    <div className="py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                      <p className="text-slate-400 font-medium italic">No videos uploaded yet.</p>
                    </div>
                  ) : (
                    videos.map((vid, idx) => (
                      <div key={vid.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-slate-200 transition-all">
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-xs font-black">
                            {idx + 1}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 truncate">{vid.title}</p>
                            <p className="text-[10px] text-primary-600 font-bold truncate tracking-tight">{vid.youtube_url}</p>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteVideo(vid.id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCourses;
