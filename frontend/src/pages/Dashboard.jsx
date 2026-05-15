import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import FeaturedCourseCard from '../components/FeaturedCourseCard';
import RecommendedCourseCard from '../components/RecommendedCourseCard';

const AnalyticsSection = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      {/* Weekly Progress Chart */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-soft group hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Weekly Progress</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Average learning pace</p>
          </div>
          <div className="px-3 py-1.5 bg-primary-50 text-primary-600 rounded-xl text-[10px] font-black tracking-wider">
            +12.5% VS LAST WEEK
          </div>
        </div>
        <div className="h-48 w-full relative flex items-end justify-between px-2 gap-3">
          {/* Simple Animated Bar Chart using SVG/Divs */}
          {[40, 70, 45, 90, 65, 80, 55].map((height, i) => (
            <div key={i} className="flex-grow flex flex-col items-center gap-3 group/bar">
              <div className="relative w-full flex items-end justify-center h-40">
                <div 
                  className="w-full max-w-[32px] bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-xl transition-all duration-1000 ease-out shadow-sm group-hover/bar:from-primary-700 group-hover/bar:to-primary-500"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                    {height}% Done
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Time Spent Learning */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-soft group hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Time Spent Learning</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hours dedicated to mastery</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-900 uppercase">Live Activity</span>
          </div>
        </div>
        <div className="relative h-48 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 400 150">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path 
              d="M0,120 Q50,80 100,100 T200,60 T300,90 T400,40 V150 H0 Z" 
              fill="url(#chartGradient)"
              className="animate-pulse-subtle"
            />
            <path 
              d="M0,120 Q50,80 100,100 T200,60 T300,90 T400,40" 
              fill="none" 
              stroke="#2563eb" 
              strokeWidth="4" 
              strokeLinecap="round"
              className="dash-offset-animate"
              strokeDasharray="1000"
              strokeDashoffset="1000"
            />
            {/* Tooltip circles */}
            <circle cx="100" cy="100" r="6" fill="white" stroke="#2563eb" strokeWidth="3" className="hover:scale-125 transition-transform cursor-pointer" />
            <circle cx="200" cy="60" r="6" fill="white" stroke="#2563eb" strokeWidth="3" className="hover:scale-125 transition-transform cursor-pointer" />
            <circle cx="300" cy="90" r="6" fill="white" stroke="#2563eb" strokeWidth="3" className="hover:scale-125 transition-transform cursor-pointer" />
          </svg>
          <div className="absolute bottom-2 left-0 w-full flex justify-between px-4">
             <span className="text-[9px] font-black text-slate-400">WK 1</span>
             <span className="text-[9px] font-black text-slate-400">WK 2</span>
             <span className="text-[9px] font-black text-slate-400">WK 3</span>
             <span className="text-[9px] font-black text-slate-400">WK 4</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [stats, setStats] = useState({
    enrolledCount: 0,
    completedLessons: 0,
    avgProgress: '0%',
    certificateCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [enrolledRes, availableRes, statsRes] = await Promise.all([
        api.get('/courses/enrolled'),
        api.get('/courses/available'),
        api.get('/courses/stats/summary')
      ]);
      setEnrolledCourses(enrolledRes.data);
      setAvailableCourses(availableRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
      setError('Could not load your learning dashboard. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      await api.post(`/courses/enroll/${courseId}`);
      navigate(`/course/${courseId}`);
    } catch (err) {
      console.error('Enrollment failed', err);
      alert('Enrollment failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-100 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="text-slate-500 font-black animate-pulse tracking-widest uppercase text-[10px]">Synchronizing Environment...</p>
      </div>
    );
  }

  // Admin Dashboard View
  if (user?.role === 'admin') {
    return (
      <div className="space-y-12 pb-12 animate-fade-in">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Control Center</h1>
          <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">Administrative Systems & Personnel</p>
        </div>

        {/* Admin Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatsCard 
            title="Total Talent" 
            value={stats.totalUsers} 
            icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
            trend="Active Base"
            onClick={() => navigate('/admin/users')}
          />
          <StatsCard 
            title="Knowledge Assets" 
            value={stats.totalCourses} 
            icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" 
            trend="Live Content"
            onClick={() => navigate('/admin/courses')}
          />
          <StatsCard 
            title="Active Learning" 
            value={stats.totalEnrollments} 
            icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
            trend="Total Impact"
            color="bg-indigo-50 text-indigo-600"
            onClick={() => navigate('/admin/users?role=student')}
          />
          <StatsCard 
            title="Verified Faculty" 
            value={stats.totalTrainers} 
            icon="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" 
            trend="Expert Staff"
            color="bg-amber-50 text-amber-600"
            onClick={() => navigate('/admin/users?role=trainer')}
          />
        </div>

        <AnalyticsSection />

        {/* Security Framework Overview */}
        <section className="bg-slate-900 rounded-[3rem] p-10 border border-slate-800 shadow-2xl relative overflow-hidden group hover:shadow-primary-900/20 transition-all duration-500">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-bl-full -mr-20 -mt-20 blur-[100px] group-hover:bg-primary-600/20 transition-all"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-5 mb-10">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center border border-emerald-500/30 shadow-inner">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">Security Infrastructure</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Multi-Layered protection status: ACTIVE</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[
                { title: 'Identity', desc: 'Bcrypt Encryption', icon: '🔒' },
                { title: 'Traffic', desc: 'HTTPS Protocol', icon: '🛡️' },
                { title: 'Media', desc: 'Dynamic Watermarks', icon: '💧' },
                { title: 'Content', desc: 'Anti-Screen Deterrents', icon: '🚫' },
                { title: 'Compliance', desc: 'Integrity Logs', icon: '⚖️' }
              ].map((pill, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:bg-white/10 transition-all hover:-translate-y-2 cursor-default group/pill">
                  <div className="text-3xl mb-4 group-hover/pill:scale-125 transition-transform duration-300">{pill.icon}</div>
                  <h4 className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-1">{pill.title}</h4>
                  <p className="text-slate-400 text-[9px] leading-relaxed font-bold">{pill.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Access Control Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div 
            onClick={() => navigate('/admin/users')}
            className="group bg-white p-12 rounded-[3.5rem] shadow-soft border border-slate-100 hover:border-primary-200 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-125 opacity-50 blur-2xl"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-primary-200 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Personnel Systems</h3>
              <p className="text-slate-500 font-bold text-sm leading-relaxed max-w-sm">Authority to deploy, audit, and regulate user accounts across the global ecosystem.</p>
              <div className="mt-10 flex items-center gap-3 text-primary-600 font-black text-xs uppercase tracking-widest">
                Execute Access <span className="transition-transform group-hover:translate-x-3">&rarr;</span>
              </div>
            </div>
          </div>

          <div 
            onClick={() => navigate('/admin/courses')}
            className="group bg-white p-12 rounded-[3.5rem] shadow-soft border border-slate-100 hover:border-amber-200 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-125 opacity-50 blur-2xl"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-amber-500 text-white rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-amber-200 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" /></svg>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Curriculum Design</h3>
              <p className="text-slate-500 font-bold text-sm leading-relaxed max-w-sm">Engineer learning paths, integrate secure video assets, and curate knowledge modules.</p>
              <div className="mt-10 flex items-center gap-3 text-amber-600 font-black text-xs uppercase tracking-widest">
                Open Designer <span className="transition-transform group-hover:translate-x-3">&rarr;</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Trainer Dashboard View
  if (user?.role === 'trainer') {
    return (
      <div className="space-y-12 pb-12 animate-fade-in">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Trainer Terminal</h1>
          <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">Course Architecture & Student Monitoring</p>
        </div>

        {/* Trainer Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <StatsCard 
            title="Managed Portfolios" 
            value={stats.totalCourses} 
            icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" 
            trend="Published"
            onClick={() => navigate('/admin/courses')}
          />
          <StatsCard 
            title="Total Students" 
            value={stats.totalStudents} 
            icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
            trend="Active Base"
          />
          <StatsCard 
            title="Content Assets" 
            value={stats.totalVideos} 
            icon="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
            trend="Video Lessons"
          />
        </div>

        <AnalyticsSection />

        {/* Main Action Card */}
        <div 
          onClick={() => navigate('/admin/courses')}
          className="group bg-white p-14 rounded-[4rem] shadow-soft border border-slate-100 hover:border-amber-200 transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-bl-full -mr-20 -mt-20 transition-transform group-hover:scale-125 opacity-60 blur-3xl"></div>
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-14">
            <div className="w-24 h-24 bg-amber-500 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-amber-200 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" /></svg>
            </div>
            <div className="flex-grow text-center lg:text-left">
              <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Curriculum Design Interface</h3>
              <p className="text-slate-500 font-bold text-xl max-w-3xl leading-relaxed">
                Engineer high-impact courses, integrate encrypted video assets, and structure 
                the learning experience. Your curriculum is the core of our educational engine.
              </p>
              <div className="mt-10 flex items-center justify-center lg:justify-start gap-4 text-amber-600 font-black text-lg uppercase tracking-widest">
                Access Content Designer <span className="transition-transform group-hover:translate-x-4">&rarr;</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-14 pb-20 animate-fade-in">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
        <StatsCard 
          title="Course Mastery" 
          value={stats.enrolledCount} 
          icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
          trend="+1 this week"
          color="bg-indigo-50 text-indigo-600"
          onClick={() => navigate('/my-courses')}
        />

        <StatsCard 
          title="Overall Progress" 
          value={stats.avgProgress} 
          icon="M13 10V3L4 14h7v7l9-11h-7z" 
          trend="+5.2%"
          color="bg-blue-50 text-blue-600"
          onClick={() => navigate('/my-courses')}
        />
        

      </div>

      <AnalyticsSection />

      {/* Continue Learning Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Curricula</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Pick up where you left off</p>
          </div>
          <button 
            onClick={() => navigate('/my-courses')}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:-translate-y-0.5 active:scale-95"
          >
            Manage My Learning
          </button>
        </div>
        
        {enrolledCourses.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center shadow-soft group hover:border-primary-200 transition-all duration-500">
            <div className="w-24 h-24 bg-primary-50 text-primary-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-4xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 shadow-inner">
               🚀
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Initiate Your Learning Engine</h3>
            <p className="text-slate-500 mb-10 max-w-sm mx-auto font-bold text-sm leading-relaxed">No active courses detected. Access the global catalog to begin your mastery journey.</p>
            <button onClick={() => navigate('/browse')} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all hover:shadow-xl hover:shadow-primary-900/10 active:scale-95">Explore Catalog</button>
          </div>
        ) : (
          <FeaturedCourseCard course={enrolledCourses[0]} />
        )}
      </section>

      {/* Recommended Section */}
      <section>
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Personalized Tracks</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Based on your activity profiles</p>
          </div>
          <button onClick={() => navigate('/browse')} className="text-primary-600 font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-2 group">
            Discover More
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>

        <div className="flex overflow-x-auto pb-10 -mx-4 px-4 gap-8 custom-scrollbar no-scrollbar-at-mobile">
          {availableCourses.length === 0 ? (
            <div className="p-12 bg-slate-50 rounded-[2.5rem] border border-slate-100 w-full text-center">
              <p className="text-slate-500 font-bold italic text-sm">Synchronizing new recommendations... Check back shortly.</p>
            </div>
          ) : (
            availableCourses.map(course => (
              <RecommendedCourseCard key={course.id} course={course} onEnroll={handleEnroll} />
            ))
          )}
        </div>
      </section>

      {/* Error Notification */}
      {error && (
        <div className="fixed bottom-8 right-8 bg-red-50 text-red-600 p-5 rounded-3xl border border-red-100 flex items-center gap-4 shadow-2xl animate-slide-up z-50">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="font-bold text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
