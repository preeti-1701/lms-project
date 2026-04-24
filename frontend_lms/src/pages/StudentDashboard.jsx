import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  Search, Bell, Home, BookOpen, FileText, CheckSquare, 
  Briefcase, Bookmark, AlertCircle, MessageCircle, User,
  Power, Sun, Share2 
} from 'lucide-react';

const StudentDashboard = () => {
    const [courses, setCourses] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const resp = await api.get('/courses/');
                setCourses(resp.data);
            } catch (err) {
                console.error("Failed to fetch courses", err);
            }
        };
        fetchCourses();
    }, []);

    const logout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex font-sans bg-[var(--primary-bg)]">
            {/* Sidebar */}
            <aside className="w-64 glass-panel border-0 m-4 flex flex-col justify-between hidden md:flex z-50 overflow-hidden">
                <div>
                    <div className="p-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white flex items-center justify-center rounded-xl text-xs shadow-lg">LMS</div>
                        <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-500 tracking-tight text-lg">PORTAL</span>
                    </div>
                    
                    <div className="px-5 mb-6 relative">
                        <Search className="absolute left-7 top-2.5 text-gray-400 w-4 h-4" />
                        <input type="text" placeholder="Search" className="w-full bg-white/60 border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm outline-none focus:border-indigo-500 hover:bg-white transition-colors shadow-sm" />
                    </div>

                    <nav className="flex flex-col gap-1 px-3">
                        <a href="#" className="flex items-center gap-3 px-3 py-2.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold shadow-sm border border-indigo-100/50 transition-all hover:translate-x-1">
                            <Home className="w-4 h-4" /> Dashboard
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-white/60 hover:shadow-sm rounded-lg text-sm font-medium transition-all hover:translate-x-1">
                            <BookOpen className="w-4 h-4" /> Courses
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-white/60 hover:shadow-sm rounded-lg text-sm font-medium transition-all hover:translate-x-1">
                            <CheckSquare className="w-4 h-4" /> Tests
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-white/60 hover:shadow-sm rounded-lg text-sm font-medium transition-all hover:translate-x-1">
                            <FileText className="w-4 h-4" /> Assignments
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-white/60 hover:shadow-sm rounded-lg text-sm font-medium transition-all hover:translate-x-1">
                            <Briefcase className="w-4 h-4" /> Company Questions
                        </a>
                    </nav>
                </div>

                <div className="p-4 border-t border-gray-100/50 space-y-4 bg-white/20">
                    <nav className="flex flex-col gap-1 px-3">
                        <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-white/60 rounded-lg text-sm font-medium transition-all">
                            <AlertCircle className="w-4 h-4" /> Support Desk
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-white/60 rounded-lg text-sm font-medium transition-all">
                            <User className="w-4 h-4" /> My Profile
                        </a>
                    </nav>

                    <div className="flex items-center justify-between px-6 text-sm text-gray-600 font-medium">
                        <span>Theme</span>
                        <div className="w-9 h-5 bg-indigo-500 rounded-full flex items-center px-0.5 cursor-pointer shadow-inner">
                            <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 px-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center font-bold text-indigo-700 shadow-sm border border-indigo-200">
                            H
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-gray-800 truncate">Harshitha</p>
                            <p className="text-[10px] text-gray-500 truncate font-medium">Student</p>
                        </div>
                        <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg">
                            <Power className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-[1200px] mx-auto">
                <header className="flex justify-between items-center mb-8 bg-white/30 backdrop-blur-md p-4 rounded-2xl border border-white max-w-full glass-panel shadow-sm animate-fade-in-up">
                    <h1 className="text-2xl font-bold text-gray-800 ml-2">Welcome Back! ✨</h1>
                    <div className="flex items-center gap-4 mr-2">
                        <button className="relative p-2 text-gray-600 hover:bg-white/50 rounded-xl transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-[var(--primary-bg)]"></span>
                        </button>
                    </div>
                </header>

                {/* Hero Banner */}
                <div className="w-full rounded-2xl overflow-hidden mb-8 relative shadow-2xl h-[220px] flex items-center pl-10 animate-fade-in-up" 
                     style={{ background: 'linear-gradient(120deg, #1e1b4b, #4338ca)', animationDelay: '0.1s' }}>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                    <div className="z-10 relative text-white">
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight">
                            Accelerate your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Career</span>
                        </h2>
                        <p className="text-lg font-medium text-indigo-100 border-l-2 border-indigo-400 pl-3 mb-6">Master full-stack development.</p>
                        <button className="bg-white text-indigo-900 px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl hover:-translate-y-1 hover:shadow-indigo-500/50 transition-all duration-300">
                            VIEW ROADMAP
                        </button>
                    </div>
                    
                    {/* Abstract visual */}
                    <div className="absolute right-0 top-0 w-1/2 h-full overflow-hidden pointer-events-none">
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-slow"></div>
                        <div className="absolute -bottom-20 right-20 w-64 h-64 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse-slow" style={{animationDelay: '1s'}}></div>
                    </div>
                </div>

                {/* Enrolled Courses */}
                <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 drop-shadow-sm">Your Enrolled Courses</h3>
                    {courses.length === 0 ? (
                        <div className="glass-panel p-12 text-center text-gray-500">
                            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="font-medium text-lg text-gray-600">No courses assigned yet.</p>
                            <p className="text-sm">When your trainer assigns one, it will appear here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map(course => (
                                <div key={course.id} className="glass-panel group cursor-pointer overflow-hidden flex flex-col h-full bg-white/50 border-white">
                                    <div className="h-32 bg-gradient-to-tr from-indigo-600 to-cyan-500 p-6 flex flex-col justify-end relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                                        <h4 className="text-xl font-bold text-white drop-shadow-lg z-10 z-10 line-clamp-2">{course.title}</h4>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <p className="text-sm text-gray-600 font-medium mb-6 line-clamp-3 flex-1">{course.description || 'Dive into this course to enhance your skills and build new capabilities.'}</p>
                                        <div className="flex justify-between items-center mt-auto">
                                            <div className="flex items-center gap-2 bg-gray-100/80 px-3 py-1.5 rounded-lg border border-gray-200">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                                <span className="text-xs font-bold text-gray-700">{course.videos?.length || 0} Modules</span>
                                            </div>
                                            <button className="text-indigo-600 font-extrabold text-sm hover:text-indigo-800 transition-colors group-hover:translate-x-1 duration-300">
                                                START ➜
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="h-12"></div>
            </main>
        </div>
    );
};

export default StudentDashboard;
