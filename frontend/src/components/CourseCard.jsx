import React from 'react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course, isEnrolled, onEnroll, progress = 0 }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-80 group-hover:scale-110 transition-transform duration-500"></div>
        <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">📚</div>
        <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider">
          {course.category || 'Development'}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
          {course.description}
        </p>

        {isEnrolled && (
          <div className="mb-4">
            <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 uppercase">
              {(course.created_by_name || 'A').charAt(0)}
            </div>
            <span className="text-xs font-medium text-gray-600">{course.created_by_name || 'Admin'}</span>
          </div>

          {isEnrolled ? (
            <Link
              to={`/course/${course.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all active:scale-95"
            >
              Continue
            </Link>
          ) : (
            <button
              onClick={() => onEnroll(course.id)}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-black transition-all active:scale-95"
            >
              Enroll Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
