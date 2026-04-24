import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
            setMsg({ text: 'Failed to create course. Please try again.', type: 'error' });
        } finally {
            setCreateLoading(false);
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
                                            <button className="text-indigo-600 text-sm font-semibold hover:text-indigo-800 transition-colors">
                                                Manage Content →
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default TrainerDashboard;
