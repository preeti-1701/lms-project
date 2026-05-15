import React, { useState, useEffect } from 'react';
import api from '../services/api';
import CourseCard from '../components/CourseCard';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses/enrolled');
        setCourses(response.data);
      } catch (error) {
        console.error('Failed to fetch courses', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Courses</h1>
          <p className="text-gray-500 mt-1">Pick up where you left off.</p>
        </div>

        <div className="relative w-full md:w-80">
          <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search my courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2].map(i => (
            <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-3xl"></div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="text-5xl mb-4">📖</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">You aren't enrolled in any courses yet.</h3>
          <p className="text-gray-500 mb-6">Head over to the catalog to find something interesting!</p>
          <a href="/browse" className="btn-primary inline-block">Browse Courses</a>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-lg font-medium">No courses found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map(course => (
            <CourseCard 
              key={course.id} 
              course={course} 
              isEnrolled={true} 
              progress={Math.floor(Math.random() * 50) + 10} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
