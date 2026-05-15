import React from 'react';
import { useNavigate } from 'react-router-dom';

const FeaturedCourseCard = ({ course }) => {
  const navigate = useNavigate();
  if (!course) return null;

  return (
    <div className="bg-gradient-to-br from-primary-600 to-indigo-900 rounded-[3rem] overflow-hidden shadow-2xl group transition-all duration-700 hover:shadow-primary-500/30 animate-fade-in relative">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20 blur-[100px] group-hover:bg-white/20 transition-all duration-1000"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-400/20 rounded-full -ml-10 -mb-10 blur-[80px]"></div>
      
      <div className="p-12 flex flex-col xl:flex-row items-center justify-between gap-12 relative z-10">
        <div className="flex-grow">
          <div className="flex items-center gap-4 mb-8">
            <span className="px-4 py-1.5 bg-white/20 backdrop-blur-xl text-white border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
              Current Session
            </span>
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-primary-600 bg-slate-200 overflow-hidden shadow-md transform hover:-translate-y-1 transition-transform cursor-pointer">
                  <img src={`https://i.pravatar.cc/100?img=${i + 15}`} alt="student" className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-primary-600 bg-primary-500 flex items-center justify-center text-[9px] font-black text-white shadow-md">
                +42
              </div>
            </div>
          </div>
          
          <h2 className="text-5xl font-black text-white mb-4 leading-tight group-hover:translate-x-2 transition-transform duration-500 tracking-tight">
            {course.title}
          </h2>
          <p className="text-primary-100/70 text-lg max-w-2xl mb-10 leading-relaxed font-medium">
            {course.description || "Architect high-performance systems and master industry-standard workflows with this expert-led curriculum."}
          </p>
          
          <div className="flex flex-wrap gap-10 mb-12">
            <div className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 rounded-[1rem] bg-white/10 flex items-center justify-center font-black border border-white/20 shadow-xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                {course.created_by_name?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Lead Instructor</p>
                <p className="text-lg font-bold">{course.created_by_name || 'Senior Architect'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="h-12 w-px bg-white/10 hidden sm:block"></div>
              <div>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Modules</p>
                <p className="text-lg font-bold">{course.video_count || 12} Lessons</p>
              </div>
              <div className="h-12 w-px bg-white/10 hidden sm:block"></div>
              <div>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Duration</p>
                <p className="text-lg font-bold">18h 45m</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-10">
            <button 
              onClick={() => navigate(`/course/${course.id}`)}
              className="w-full lg:w-auto px-10 py-5 bg-white text-primary-900 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 active:scale-95 transition-all shadow-2xl shadow-black/20 flex items-center justify-center gap-4 group/btn"
            >
              Resume Track
              <svg className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            
            <div className="flex-grow max-w-md w-full">
              <div className="flex justify-between text-[11px] font-black text-white/80 uppercase tracking-widest mb-3">
                <span>Core Progress</span>
                <span className="text-white">78%</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-white to-primary-200 rounded-full w-[78%] shadow-[0_0_20px_rgba(255,255,255,0.6)] transition-all duration-1000 ease-out animate-pulse-slow"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCourseCard;
