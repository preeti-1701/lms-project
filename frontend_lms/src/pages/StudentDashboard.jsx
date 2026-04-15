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
        <div className="min-h-screen bg-[#f8f9fa] flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 fixed h-full flex flex-col justify-between hidden md:flex z-50">
                <div>
                    <div className="p-4 flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-600 font-bold text-white flex items-center justify-center rounded text-xs">TAP</div>
                        <span className="font-bold text-blue-900 tracking-tight text-sm">ACADEMY</span>
                    </div>
                    
                    <div className="px-4 mb-4 relative">
                        <Search className="absolute left-6 top-2.5 text-gray-400 w-4 h-4" />
                        <input type="text" placeholder="Search" className="w-full bg-gray-50 border border-gray-200 rounded-md py-2 pl-8 pr-4 text-sm outline-none focus:border-blue-500 transition-colors" />
                    </div>

                    <nav className="flex flex-col gap-1 px-2">
                        <a href="#" className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 text-blue-600 rounded-md text-sm font-medium">
                            <Home className="w-4 h-4" /> Dashboard
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md text-sm">
                            <BookOpen className="w-4 h-4" /> Courses
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md text-sm">
                            <CheckSquare className="w-4 h-4" /> Tests
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md text-sm">
                            <FileText className="w-4 h-4" /> Assignments
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md text-sm">
                            <Briefcase className="w-4 h-4" /> Company Questions
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md text-sm">
                            <Briefcase className="w-4 h-4" /> Jobs
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md text-sm">
                            <Bookmark className="w-4 h-4" /> Bookmarks
                        </a>
                    </nav>
                </div>

                <div className="p-4 border-t border-gray-100 space-y-4">
                    <nav className="flex flex-col gap-1">
                        <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md text-sm">
                            <AlertCircle className="w-4 h-4" /> Report an issue
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md text-sm">
                            <MessageCircle className="w-4 h-4" /> Ask TAI
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md text-sm">
                            <User className="w-4 h-4" /> Profile
                        </a>
                    </nav>

                    <div className="flex items-center justify-between px-3 text-sm text-gray-600">
                        <span>Light Mode</span>
                        <div className="w-8 h-4 bg-gray-300 rounded-full flex items-center px-0.5 cursor-pointer">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 flex-shrink-0">
                            H
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">Harshitha</p>
                            <p className="text-xs text-gray-500 truncate">harshithan2121@gmail.com</p>
                        </div>
                        <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors">
                            <Power className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-6 lg:p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 hidden md:block"></h1>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-4">
                        <div className="relative cursor-pointer">
                            <Bell className="w-5 h-5 text-gray-600" />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">99+</span>
                        </div>
                    </div>
                </header>

                {/* Hero Banner */}
                <div className="w-full bg-black rounded-2xl overflow-hidden mb-8 relative shadow-lg h-[200px] flex items-center pl-10">
                    <div className="z-10 relative text-white">
                        <h2 className="text-5xl font-extrabold mb-1 tracking-tight">
                            Keep <span className="text-yellow-400">LEARN</span>ing
                        </h2>
                        <p className="text-lg font-medium text-gray-200 mb-4">Earn ₹2000 for each referral</p>
                        <button className="bg-red-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg hover:bg-red-700 transition">
                            REGISTER NOW
                        </button>
                    </div>
                    {/* Placeholder for images on the right of banner */}
                    <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-blue-900/40 to-transparent">
                         {/* Abstract nodes background dummy */}
                         <div className="absolute right-10 top-1/2 -translate-y-1/2 w-64 h-32 bg-white/10 backdrop-blur-sm border border-white/20 rounded border-dashed flex items-center justify-center">
                             <span className="text-white/50 text-xs">Hero Graphics Placeholder</span>
                         </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Column */}
                    <div className="flex-[2] flex flex-col gap-6">
                        {/* Employability Score */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                            <h3 className="text-gray-700 font-semibold absolute top-6 left-6">Employability Score</h3>
                            <div className="mt-8 relative w-48 h-24 overflow-hidden">
                                <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[20px] border-gray-200 border-b-transparent border-r-transparent -rotate-45"></div>
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-4xl font-extrabold text-black">
                                    0
                                </div>
                            </div>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 scale-75 origin-right">
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400"></div><span className="text-xs text-gray-500">0 to 35</span></div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400"></div><span className="text-xs text-gray-500">36 to 70</span></div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400"></div><span className="text-xs text-gray-500">71 to 100</span></div>
                            </div>
                        </div>

                        {/* Skills Acquired */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-gray-700 font-semibold mb-4">Skills Acquired</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border border-gray-100 rounded-lg p-4 shadow-sm flex flex-col justify-between">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-semibold text-gray-800 text-sm">Core Java</p>
                                            <p className="text-xs text-blue-500 font-medium pb-1 border-b border-blue-100 inline-block">Beginner</p>
                                        </div>
                                        <div className="flex gap-0.5">
                                            {[1,2,3,4,5].map(i => <StarIcon key={i} />)}
                                        </div>
                                    </div>
                                    <div className="flex justify-end"><span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 rounded">TAP ACADEMY</span></div>
                                </div>
                                <div className="border border-gray-100 rounded-lg p-4 shadow-sm flex flex-col justify-between">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-semibold text-gray-800 text-sm">Programming</p>
                                            <p className="text-xs text-purple-500 font-medium pb-1 border-b border-purple-100 inline-block">Intermediate</p>
                                        </div>
                                        <div className="flex gap-0.5">
                                            {[1,2,3,4,5].map(i => <StarIcon key={i} />)}
                                        </div>
                                    </div>
                                    <div className="flex justify-end"><span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 rounded">TAP ACADEMY</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Drives Data */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-gray-700 font-semibold mb-6">Drives Data</h3>
                            <div className="flex justify-between items-center h-48">
                                {/* Chart Area */}
                                <div className="flex-1 h-full border-b border-l border-gray-200 relative flex items-end pl-8 pb-0.5 pr-4 justify-center gap-2">
                                    {/* Y axis labels */}
                                    <div className="absolute left-[-20px] h-full flex flex-col justify-between text-[10px] text-gray-400 font-medium py-1">
                                        <span>28</span><span>20</span><span>15</span><span>10</span><span>5</span><span>0</span>
                                    </div>
                                    <div className="absolute left-[-45px] top-1/2 -rotate-90 text-[10px] text-gray-400 origin-center whitespace-nowrap">Total Drives</div>

                                    {/* Bars */}
                                    <div className="w-16 bg-blue-300 h-[85%] rounded-t-sm relative group">
                                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-gray-500 font-medium">24</span>
                                    </div>
                                    <div className="w-16 bg-blue-600 h-[42%] rounded-t-sm relative group">
                                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-gray-500 font-medium">12</span>
                                    </div>
                                    
                                    <div className="absolute -bottom-6 w-full text-center text-xs text-gray-500">Drives</div>
                                </div>

                                {/* Legend */}
                                <div className="w-40 pl-6 flex flex-col gap-2">
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-300"></div><span className="text-xs text-gray-600">Eligible Drives</span></div>
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600"></div><span className="text-xs text-gray-600">Applied Drives</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bars Section */}
                        <div className="flex flex-col gap-4">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center font-bold font-mono">{"<>"}</div>
                                    <span className="font-semibold text-gray-800">SQL</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <div className="bg-blue-600 h-full w-[77.72%] rounded-full"></div>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-600 w-12 text-right">77.72%</span>
                                </div>
                                <div className="flex justify-end">
                                    <button className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition">Resume practice</button>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center font-bold font-mono">{"<>"}</div>
                                    <div>
                                        <span className="font-semibold text-gray-800 block">JAVA_Wrapper class and Arrays</span>
                                        <span className="text-xs text-gray-500 block -mt-1">Tap Academy</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <div className="bg-blue-600 h-full w-[8.7%] rounded-full"></div>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-600 w-12 text-right">8.7%</span>
                                </div>
                                <div className="flex justify-end">
                                    <button className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition">Resume course</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Leaderboard) */}
                    <div className="flex-[1.2] flex flex-col gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 min-h-[500px]">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h3 className="text-gray-800 font-bold text-lg">Leaderboard</h3>
                                    <p className="text-xs text-gray-500">Overall Top Performers</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <select className="border border-gray-200 rounded text-xs py-1 px-2 outline-none text-gray-600 font-medium bg-transparent">
                                        <option>Total</option>
                                    </select>
                                    <Share2 className="w-4 h-4 text-gray-600 cursor-pointer" />
                                </div>
                            </div>

                            {/* Podiums */}
                            <div className="flex justify-center items-end gap-2 mb-10 mt-6 relative h-40">
                                {/* 2nd Place */}
                                <div className="flex flex-col items-center translate-y-4">
                                    <div className="w-14 h-14 bg-amber-400 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md z-10 relative">
                                        N
                                        <div className="absolute -bottom-2 w-5 h-5 bg-gray-800 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white">2</div>
                                    </div>
                                    <p className="text-xs font-semibold text-gray-800 mt-3 truncate w-20 text-center">Nagulapally</p>
                                    <p className="text-[10px] text-gray-500">9505</p>
                                </div>

                                {/* 1st Place */}
                                <div className="flex flex-col items-center -translate-y-4 z-20">
                                    <div className="absolute -top-6 text-2xl">👑</div>
                                    <div className="w-20 h-20 bg-[#aed5af] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg relative">
                                        H
                                        <div className="absolute -bottom-2 w-6 h-6 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">1</div>
                                    </div>
                                    <p className="text-sm font-bold text-gray-800 mt-4 truncate w-24 text-center">Hemanth Reddy</p>
                                    <p className="text-xs text-gray-500">10035</p>
                                </div>

                                {/* 3rd Place */}
                                <div className="flex flex-col items-center translate-y-6">
                                    <div className="w-12 h-12 bg-[#e99a46] rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md z-10 relative">
                                        D
                                        <div className="absolute -bottom-2 w-5 h-5 bg-gray-800 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white">3</div>
                                    </div>
                                    <p className="text-xs font-semibold text-gray-800 mt-3 truncate w-20 text-center">Dhinakar</p>
                                    <p className="text-[10px] text-gray-500">9157</p>
                                </div>
                            </div>

                            {/* List block */}
                            <div className="flex flex-col gap-3 mt-4">
                                <LeaderboardRow rank={4} initials="S" name="Srilekha Velagala" score="8421" />
                                <LeaderboardRow rank={5} initials="K" name="Kethari" score="7993" />
                                <LeaderboardRow rank={1027} initials="H" name="Harshitha" score="4484" isSelf={true} />
                            </div>

                            <button className="w-full mt-6 text-center text-xs text-blue-600 font-semibold hover:underline">
                                Show more ⌄
                            </button>
                        </div>
                    </div>
                </div>

                {/* Database Connected Courses Section */}
                <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Your Enrolled Courses</h3>
                    {courses.length === 0 ? (
                        <div className="bg-white border text-center border-gray-100 rounded-xl p-8 text-gray-500">
                            No courses assigned yet. Check back later!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {courses.map(course => (
                                <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform">
                                    <div className="h-32 bgGradient-to-r bg-blue-600 flex items-center justify-center p-4">
                                        <h4 className="text-xl font-bold text-white text-center drop-shadow-md">{course.title}</h4>
                                    </div>
                                    <div className="p-5">
                                        <p className="text-sm text-gray-500 line-clamp-2">{course.description || 'No description available for this course.'}</p>
                                        <div className="flex justify-between items-center mt-4">
                                            <span className="text-xs font-semibold text-gray-500">{course.videos?.length || 0} Videos</span>
                                            <button className="text-blue-600 font-bold text-sm bg-blue-50 px-4 py-1.5 rounded hover:bg-blue-100">View</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Optional Add margin at bottom so content isn't flush against edge */}
                <div className="h-10"></div>
            </main>
        </div>
    );
};

const StarIcon = () => (
    <svg className="w-3 h-3 text-yellow-400 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
)

const LeaderboardRow = ({ rank, initials, name, score, isSelf }) => (
    <div className={`flex items-center gap-4 py-3 px-4 rounded-lg font-medium text-sm ${isSelf ? 'bg-[#d0e1f9] border border-blue-200' : 'bg-gray-50 border border-gray-100'}`}>
        <span className="text-gray-500 w-6 text-center">{rank}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-gray-600 font-bold ${isSelf ? 'bg-white' : 'bg-white border border-gray-200'}`}>
            {initials}
        </div>
        <span className="flex-1 text-gray-800">{name}</span>
        <span className="text-gray-900 font-bold">{score}</span>
    </div>
)

export default StudentDashboard;
