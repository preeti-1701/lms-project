import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  Search, Bell, Home, BookOpen, FileText, CheckSquare, 
  Briefcase, Bookmark, AlertCircle, MessageCircle, User,
  Power, Sun, Share2, PlayCircle, ArrowLeft
} from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';

const StudentDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [activeCourse, setActiveCourse] = useState(null);
    const [activeVideoIndex, setActiveVideoIndex] = useState(0);
    const [enrollLoading, setEnrollLoading] = useState(null);
    const [userInfo, setUserInfo] = useState(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try { return JSON.parse(userStr); } catch { return null; }
        }
        return null;
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const resp = await api.get('/courses/');
                setCourses(resp.data);
                
                // Fetch all published courses
                const allResp = await api.get('/courses/published/');
                setAllCourses(allResp.data);
            } catch (err) {
                console.error("Failed to fetch courses", err);
            }
        };
        fetchCourses();
    }, [activeTab]);

    const handleEnroll = async (courseId) => {
        setEnrollLoading(courseId);
        try {
            await api.post(`/courses/${courseId}/enroll/`);
            // Refresh data
            const [resp, allResp] = await Promise.all([
                api.get('/courses/'),
                api.get('/courses/published/')
            ]);
            setCourses(resp.data);
            setAllCourses(allResp.data);
            setActiveTab('dashboard'); // Redirect to dashboard to see enrolled course
        } catch (err) {
            console.error("Failed to enroll", err);
            alert(err.response?.data?.detail || "Failed to enroll in course");
        } finally {
            setEnrollLoading(null);
        }
    };

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
                        {[
                          {id:'dashboard', icon:Home, label:'Dashboard'},
                          {id:'courses', icon:BookOpen, label:'Courses'},
                          {id:'tests', icon:CheckSquare, label:'Tests'},
                          {id:'assignments', icon:FileText, label:'Assignments'},
                          {id:'company', icon:Briefcase, label:'Company Questions'}
                        ].map(item => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all hover:translate-x-1 w-full text-left ${isActive ? 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100/50' : 'text-gray-600 hover:bg-white/60 hover:shadow-sm'}`}>
                                    <Icon className="w-4 h-4" /> {item.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t border-gray-100/50 space-y-4 bg-white/20">
                    <nav className="flex flex-col gap-1 px-3">
                        {[
                          {id:'support', icon:AlertCircle, label:'Support Desk'},
                          {id:'profile', icon:User, label:'My Profile'}
                        ].map(item => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full text-left ${isActive ? 'bg-white/80 text-indigo-600 shadow-sm' : 'text-gray-600 hover:bg-white/60'}`}>
                                    <Icon className="w-4 h-4" /> {item.label}
                                </button>
                            );
                        })}
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
                            <p className="text-sm font-bold text-gray-800 truncate">{userInfo?.first_name || userInfo?.username || 'Student'}</p>
                            <p className="text-[10px] text-gray-500 truncate font-medium">{userInfo?.role || 'Student'}</p>
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
                    <h1 className="text-2xl font-bold text-gray-800 ml-2">
                        {activeTab === 'dashboard' ? 'Welcome Back! ✨' : 
                         activeTab === 'player' && activeCourse ? activeCourse.title :
                         activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('company', 'Company Questions')}
                    </h1>
                    <div className="flex items-center gap-4 mr-2">
                        <button className="relative p-2 text-gray-600 hover:bg-white/50 rounded-xl transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-[var(--primary-bg)]"></span>
                        </button>
                    </div>
                </header>

                {activeTab === 'dashboard' && (
                    <div className="animate-fade-in-up">
                        {/* Hero Banner */}
                        <div className="w-full rounded-2xl overflow-hidden mb-8 relative shadow-2xl h-[220px] flex items-center pl-10" 
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
                        <div className="mt-8" style={{ animationDelay: '0.2s' }}>
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
                                                <h4 className="text-xl font-bold text-white drop-shadow-lg z-10 line-clamp-2">{course.title}</h4>
                                            </div>
                                            <div className="p-6 flex-1 flex flex-col">
                                                <p className="text-sm text-gray-600 font-medium mb-6 line-clamp-3 flex-1">{course.description || 'Dive into this course to enhance your skills and build new capabilities.'}</p>
                                                <div className="flex justify-between items-center mt-auto">
                                                    <div className="flex items-center gap-2 bg-gray-100/80 px-3 py-1.5 rounded-lg border border-gray-200">
                                                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                                        <span className="text-xs font-bold text-gray-700">{course.videos?.length || 0} Modules</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => { setActiveCourse(course); setActiveVideoIndex(0); setActiveTab('player'); }}
                                                        className="text-indigo-600 font-extrabold text-sm hover:text-indigo-800 transition-colors group-hover:translate-x-1 duration-300"
                                                    >
                                                        START ➜
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'courses' && (
                    <div className="mt-8 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-800 drop-shadow-sm">Course Catalog</h3>
                            <span className="badge badge-outline bg-white">{allCourses.length} Available</span>
                        </div>
                        {allCourses.length === 0 ? (
                            <div className="glass-panel p-12 text-center text-gray-500">
                                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p className="font-medium text-lg text-gray-600">No courses available right now.</p>
                                <p className="text-sm">Check back later for new publications.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {allCourses.map(course => {
                                    const isEnrolled = courses.some(c => c.id === course.id);
                                    return (
                                        <div key={course.id} className="glass-panel group overflow-hidden flex flex-col h-full bg-white/50 border-white hover:shadow-xl transition-all hover:-translate-y-1">
                                            <div className="h-32 bg-gradient-to-tr from-purple-600 to-indigo-500 p-6 flex flex-col justify-end relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                                                <h4 className="text-xl font-bold text-white drop-shadow-lg z-10 line-clamp-2">{course.title}</h4>
                                            </div>
                                            <div className="p-6 flex-1 flex flex-col">
                                                <p className="text-sm text-gray-600 font-medium mb-6 line-clamp-3 flex-1">{course.description || 'Enhance your skills with this comprehensive course.'}</p>
                                                
                                                <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 mb-6">
                                                    <div className="flex items-center gap-1 bg-gray-100/80 px-2 py-1 rounded">
                                                        <BookOpen className="w-3 h-3" /> {course.videos?.length || 0} Modules
                                                    </div>
                                                    <div className="flex items-center gap-1 bg-gray-100/80 px-2 py-1 rounded">
                                                        <User className="w-3 h-3" /> {course.assigned_users?.length || 0} / {course.max_capacity || '∞'}
                                                    </div>
                                                </div>

                                                {isEnrolled ? (
                                                    <button 
                                                        onClick={() => setActiveTab('dashboard')}
                                                        className="w-full py-2.5 rounded-xl font-bold text-sm bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 transition-colors"
                                                    >
                                                        Already Enrolled
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleEnroll(course.id)}
                                                        disabled={enrollLoading === course.id || (course.max_capacity && (course.assigned_users?.length || 0) >= course.max_capacity)}
                                                        className="w-full py-2.5 rounded-xl font-bold text-sm btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {enrollLoading === course.id ? 'Enrolling...' : (course.max_capacity && (course.assigned_users?.length || 0) >= course.max_capacity) ? 'Course Full' : 'Enroll Now'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'player' && activeCourse && (
                    <div className="animate-fade-in-up">
                        <button 
                            onClick={() => setActiveTab('dashboard')} 
                            className="flex items-center gap-2 text-indigo-600 font-bold mb-6 hover:text-indigo-800 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                        </button>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                {activeCourse.videos && activeCourse.videos.length > 0 ? (
                                    <VideoPlayer url={activeCourse.videos[activeVideoIndex]?.youtube_link} />
                                ) : (
                                    <div className="aspect-video bg-gray-900 rounded-2xl flex items-center justify-center border border-gray-800 shadow-2xl">
                                        <div className="text-center text-gray-500">
                                            <PlayCircle className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                                            <p className="font-bold text-lg">No Videos Available</p>
                                            <p className="text-sm">Your trainer hasn't uploaded any content yet.</p>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="glass-panel p-6">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{activeCourse.title}</h2>
                                    <p className="text-gray-600">{activeCourse.description}</p>
                                </div>
                            </div>
                            
                            <div className="lg:col-span-1 glass-panel h-fit max-h-[800px] overflow-hidden flex flex-col">
                                <div className="p-5 border-b border-gray-100 bg-white/40">
                                    <h3 className="font-bold text-gray-800 text-lg">Course Curriculum</h3>
                                    <p className="text-sm text-gray-500">{activeCourse.videos?.length || 0} Modules</p>
                                </div>
                                <div className="overflow-y-auto flex-1 p-2">
                                    {activeCourse.videos && activeCourse.videos.length > 0 ? (
                                        activeCourse.videos.map((video, index) => (
                                            <button 
                                                key={video.id}
                                                onClick={() => setActiveVideoIndex(index)}
                                                className={`w-full text-left p-4 flex items-start gap-4 rounded-xl transition-all ${
                                                    activeVideoIndex === index 
                                                    ? 'bg-indigo-50 border border-indigo-100 shadow-sm' 
                                                    : 'hover:bg-white/60 border border-transparent'
                                                }`}
                                            >
                                                <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                    activeVideoIndex === index ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className={`font-semibold text-sm ${activeVideoIndex === index ? 'text-indigo-900' : 'text-gray-700'}`}>
                                                        {video.title}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">Video Module</p>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-gray-400">
                                            <p className="text-sm">Playlist empty</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && userInfo && (
                    <div className="animate-fade-in-up">
                        <div className="glass-panel p-8 md:p-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                            
                            <h3 className="text-2xl font-bold text-gray-800 mb-8 drop-shadow-sm">Account Settings</h3>
                            
                            <div className="flex flex-col md:flex-row gap-10 items-start relative z-10">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-5xl font-bold shadow-xl border-4 border-white">
                                        {userInfo.first_name ? userInfo.first_name.charAt(0).toUpperCase() : userInfo.email ? userInfo.email.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <span className="badge badge-outline bg-indigo-50 text-indigo-700 border-indigo-200">
                                        {userInfo.role || 'Student'}
                                    </span>
                                </div>
                                
                                <div className="flex-1 space-y-8 w-full">
                                    <div>
                                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                            {userInfo.first_name || userInfo.last_name ? `${userInfo.first_name || ''} ${userInfo.last_name || ''}` : userInfo.username || 'User Profile'}
                                        </h2>
                                        <p className="text-gray-500 mt-1">Manage your personal information and preferences.</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 pt-8 border-t border-gray-100">
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Email Address</p>
                                            <p className="text-gray-800 font-semibold text-lg">{userInfo.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Phone Number</p>
                                            <p className="text-gray-800 font-semibold text-lg">{userInfo.phone || 'Not Provided'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Account Status</p>
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 text-sm font-bold shadow-sm">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Active
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab !== 'dashboard' && activeTab !== 'courses' && activeTab !== 'player' && activeTab !== 'profile' && (
                    <div className="glass-panel p-12 text-center text-gray-500 animate-fade-in-up mt-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h2>
                        <p className="text-gray-500 max-w-md mx-auto">The {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('company', 'Company Questions')} section is currently under development. Check back later for updates!</p>
                    </div>
                )}

                <div className="h-12"></div>
            </main>
        </div>
    );
};

export default StudentDashboard;
