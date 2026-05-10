import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle, Plus, Trash2 } from 'lucide-react';
import api from '../api/axios';

const TrainerDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form States
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [maxCapacity, setMaxCapacity] = useState('');
    const [createLoading, setCreateLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    // Video Management States
    const [activeCourse, setActiveCourse] = useState(null);
    const [videoTitle, setVideoTitle] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [videoLoading, setVideoLoading] = useState(false);

    const navigate = useNavigate();

    const fetchCourses = async () => {
        try {
            const resp = await api.get('/courses/');
            setCourses(resp.data);
        } catch (err) {
            console.error("Failed to fetch courses", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        setMsg({ text: '', type: '' });

        try {
            const resp = await api.post('/courses/', { 
                title, 
                description,
                max_capacity: maxCapacity ? parseInt(maxCapacity) : null,
                status: 'PUBLISHED'
            });
            setCourses([resp.data, ...courses]);
            setTitle('');
            setDescription('');
            setMaxCapacity('');
            setMsg({ text: 'Course successfully published!', type: 'success' });
        } catch (err) {
            console.error("Failed to create course", err);
            let errorMessage = 'Failed to create course. Please try again.';
            if (err.response && err.response.data && typeof err.response.data === 'object') {
                const errors = Object.values(err.response.data).flat();
                if (errors.length > 0 && typeof errors[0] === 'string') {
                    errorMessage = errors[0];
                }
            }
            setMsg({ text: errorMessage, type: 'error' });
        } finally {
            setCreateLoading(false);
        }
    };

    const handleAddVideo = async (e) => {
        e.preventDefault();
        setVideoLoading(true);
        setMsg({ text: '', type: '' });

        try {
            const resp = await api.post(`/courses/${activeCourse.id}/videos/`, { 
                title: videoTitle, 
                youtube_link: videoUrl,
                order: (activeCourse.videos?.length || 0) + 1
            });
            
            const updatedCourse = {
                ...activeCourse,
                videos: [...(activeCourse.videos || []), resp.data]
            };
            setActiveCourse(updatedCourse);
            setCourses(courses.map(c => c.id === activeCourse.id ? updatedCourse : c));
            setVideoTitle('');
            setVideoUrl('');
            setMsg({ text: 'Video successfully added!', type: 'success' });
        } catch (err) {
            console.error("Failed to add video", err);
            setMsg({ text: 'Failed to add video. Please ensure it is a valid URL.', type: 'error' });
        } finally {
            setVideoLoading(false);
        }
    };

    const handleDeleteVideo = async (videoId) => {
        if (!window.confirm("Are you sure you want to delete this video module?")) return;
        
        try {
            await api.delete(`/courses/${activeCourse.id}/videos/${videoId}/`);
            const updatedVideos = activeCourse.videos.filter(v => v.id !== videoId);
            const updatedCourse = { ...activeCourse, videos: updatedVideos };
            
            setActiveCourse(updatedCourse);
            setCourses(courses.map(c => c.id === activeCourse.id ? updatedCourse : c));
            setMsg({ text: 'Video successfully deleted.', type: 'success' });
        } catch (err) {
            console.error("Failed to delete video", err);
            setMsg({ text: 'Failed to delete video.', type: 'error' });
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm("WARNING: Are you sure you want to permanently delete this ENTIRE course and all of its videos? This action cannot be undone.")) return;
        
        try {
            await api.delete(`/courses/${courseId}/`);
            setCourses(courses.filter(c => c.id !== courseId));
            setMsg({ text: 'Course successfully deleted.', type: 'success' });
            
            // If the deleted course was open in the modal, close it
            if (activeCourse && activeCourse.id === courseId) {
                setActiveCourse(null);
            }
        } catch (err) {
            console.error("Failed to delete course", err);
            setMsg({ text: 'Failed to delete course.', type: 'error' });
        }
    };

    const logout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="min-h-screen py-8 px-4 sm:px-8 max-w-[1600px] mx-auto">
            <header className="flex justify-between items-center mb-10 pl-2">
                <div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
                        Trainer Workspace
                    </h1>
                    <p className="text-gray-500 mt-1">Design, publish, and manage your courses.</p>
                </div>
                <button onClick={logout} className="btn-secondary text-red-600 hover:bg-red-50 hover:border-red-200">
                    Sign Out
                </button>
            </header>
            
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Left Column: Create Course Form */}
                    <div className="lg:col-span-1 glass-panel animate-fade-in-up">
                        <div className="p-6 border-b border-gray-100 bg-white/40">
                            <h2 className="text-xl font-bold text-gray-800">Launch Course</h2>
                            <p className="text-sm text-gray-500 mt-1">Instantly distribute content to students</p>
                        </div>
                        
                        <div className="p-6 bg-white/30">
                            {msg.text && (
                                <div className={`p-4 mb-6 rounded-lg text-sm font-semibold border-l-4 shadow-sm ${msg.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-rose-50 border-rose-500 text-rose-800'}`}>
                                    {msg.text}
                                </div>
                            )}

                            <form onSubmit={handleCreateCourse} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Course Title</label>
                                    <input 
                                        type="text" 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        placeholder="e.g. Advanced Python Patterns"
                                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Description</label>
                                    <textarea 
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                        rows="4"
                                        placeholder="Provide a detailed overview..."
                                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm resize-none"
                                    ></textarea>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Max Capacity</label>
                                    <input 
                                        type="number" 
                                        value={maxCapacity}
                                        onChange={(e) => setMaxCapacity(e.target.value)}
                                        max="2147483647"
                                        placeholder="Leave blank for infinite"
                                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={createLoading}
                                    className="w-full btn-primary disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                                >
                                    {createLoading ? 'Publishing...' : 'Publish Course'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Live Course Feed */}
                    <div className="lg:col-span-2 glass-panel animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div className="p-6 border-b border-gray-100 bg-white/40 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Your Curriculum</h2>
                                <p className="text-sm text-gray-500 mt-1">Review active publications</p>
                            </div>
                            <span className="badge badge-active drop-shadow-sm">
                                {courses.length} Active
                            </span>
                        </div>
                        
                        <div className="p-6 space-y-4 max-h-[700px] overflow-y-auto">
                            {courses.length === 0 ? (
                                <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                                    <p className="text-gray-500 font-medium">No courses exist yet.</p>
                                    <p className="text-sm text-gray-400 mt-1">Use the panel on the left to create one!</p>
                                </div>
                            ) : (
                                courses.map(course => (
                                    <div key={course.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-all hover:-translate-y-1 group relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                                                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{course.description}</p>
                                            </div>
                                            <span className="badge badge-outline">{course.status}</span>
                                        </div>
                                        <div className="mt-5 flex items-center justify-between pt-4 border-t border-gray-50">
                                            <div className="flex items-center gap-4">
                                                <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                                                    {course.videos?.length || 0} Videos
                                                </span>
                                                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                                                    {course.assigned_users?.length || 0} / {course.max_capacity || '∞'} Enrolled
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteCourse(course.id);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5"
                                                    title="Delete Course"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setActiveCourse(course);
                                                        setMsg({ text: '', type: '' });
                                                    }}
                                                    className="text-indigo-600 text-sm font-semibold hover:text-indigo-800 transition-colors"
                                                >
                                                    Manage Content →
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            )}

            {/* Video Manager Modal/View */}
            {activeCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <button 
                                    onClick={() => {
                                        setActiveCourse(null);
                                        setMsg({ text: '', type: '' });
                                    }}
                                    className="flex items-center gap-2 text-indigo-600 font-bold mb-2 hover:text-indigo-800 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back to Curriculum
                                </button>
                                <h2 className="text-2xl font-bold text-gray-900">{activeCourse.title}</h2>
                                <p className="text-sm text-gray-500 mt-1">Manage video modules for this course</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 flex flex-col lg:flex-row gap-8">
                            {/* Add Video Form */}
                            <div className="w-full lg:w-1/3">
                                <div className="glass-panel p-6 bg-indigo-50/30 border border-indigo-100">
                                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <Plus className="w-5 h-5 text-indigo-500" /> Add New Video
                                    </h3>
                                    
                                    {msg.text && (
                                        <div className={`p-3 mb-4 rounded-lg text-sm font-semibold border-l-4 shadow-sm ${msg.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-rose-50 border-rose-500 text-rose-800'}`}>
                                            {msg.text}
                                        </div>
                                    )}

                                    <form onSubmit={handleAddVideo} className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Module Title</label>
                                            <input 
                                                type="text" 
                                                value={videoTitle}
                                                onChange={(e) => setVideoTitle(e.target.value)}
                                                required
                                                placeholder="e.g. Introduction to Variables"
                                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">YouTube Link</label>
                                            <input 
                                                type="url" 
                                                value={videoUrl}
                                                onChange={(e) => setVideoUrl(e.target.value)}
                                                required
                                                placeholder="https://youtu.be/..."
                                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                                            />
                                        </div>
                                        <button 
                                            type="submit" 
                                            disabled={videoLoading}
                                            className="w-full btn-primary py-2.5 disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
                                        >
                                            {videoLoading ? 'Uploading...' : 'Publish Video'}
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Existing Videos List */}
                            <div className="w-full lg:w-2/3">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <PlayCircle className="w-5 h-5 text-indigo-500" /> Existing Modules
                                </h3>
                                
                                <div className="space-y-3">
                                    {!activeCourse.videos || activeCourse.videos.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                                            <p className="text-gray-500 font-medium">No videos added yet.</p>
                                            <p className="text-sm text-gray-400 mt-1">Use the form to upload the first module.</p>
                                        </div>
                                    ) : (
                                        activeCourse.videos.map((video, index) => (
                                            <div key={video.id} className="flex items-center gap-4 bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-all">
                                                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 font-bold rounded-lg flex items-center justify-center flex-shrink-0">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <h4 className="font-bold text-gray-800 truncate">{video.title}</h4>
                                                    <a href={video.youtube_link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:text-indigo-700 truncate block mt-0.5">
                                                        {video.youtube_link}
                                                    </a>
                                                </div>
                                                <button 
                                                    onClick={() => handleDeleteVideo(video.id)}
                                                    className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
                                                    title="Delete Video"
                                                >
                                                    <Trash2 className="w-5 h-5" />
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

export default TrainerDashboard;
