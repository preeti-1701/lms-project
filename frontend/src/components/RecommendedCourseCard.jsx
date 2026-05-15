import React from 'react';
import { useNavigate } from 'react-router-dom';

const RecommendedCourseCard = ({ course, onEnroll }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/course/${course.id}`)}
      className="group w-72 flex-shrink-0 card-premium p-4 relative overflow-hidden cursor-pointer"
    >
      <div className="relative h-40 mb-4 rounded-2xl overflow-hidden bg-slate-100">
        <img 
          src={course.thumbnail || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60`} 
          alt={course.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-bold text-primary-600 uppercase">
          {course.level || 'Beginner'}
        </div>
      </div>
      
      <h4 className="text-base font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
        {course.title}
      </h4>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1 text-amber-500">
          <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-[11px] font-bold">{course.rating || '4.8'}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[11px] font-bold">{course.duration || '6h 30m'}</span>
        </div>
      </div>
      
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onEnroll(course.id);
        }}
        className="w-full py-2.5 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs hover:bg-primary-600 hover:text-white transition-all shadow-sm group-hover:shadow-md"
      >
        Enroll Now
      </button>
    </div>
  );
};

export default RecommendedCourseCard;
