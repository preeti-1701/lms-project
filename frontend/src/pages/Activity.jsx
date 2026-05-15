import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Activity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await api.get('/courses/activity/recent');
        setActivities(res.data);
      } catch (err) {
        console.error('Failed to fetch activity', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  const handleActivityClick = (activity) => {
    if (activity.video_id) {
      navigate(`/course/${activity.course_id}/video/${activity.video_id}`);
    } else if (activity.course_id) {
      navigate(`/course/${activity.course_id}`);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'Lesson Completed':
        return (
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm border border-emerald-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'New Course':
        return (
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm border border-blue-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Retrieving activity logs...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Activity Log</h1>
        <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">Real-time synchronization of your learning progress</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <h2 className="text-lg font-black text-slate-900">Recent Events</h2>
          <span className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 tracking-wider uppercase">
            Live Feed
          </span>
        </div>

        <div className="divide-y divide-slate-50">
          {activities.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
                📡
              </div>
              <p className="text-slate-500 font-bold italic">No recent activity detected. Your journey starts here.</p>
            </div>
          ) : (
            activities.map((activity, index) => (
              <div 
                key={index} 
                onClick={() => handleActivityClick(activity)}
                className="p-6 hover:bg-slate-50/50 transition-all flex items-start gap-5 group cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {getActivityIcon(activity.type)}
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-primary-600 transition-colors">
                      {activity.title}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed mb-2">
                    {activity.subtitle}
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest">
                    {activity.type}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Security Footer */}
      <div className="p-6 bg-slate-900 rounded-3xl flex items-center gap-6 border border-slate-800 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
         <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/30 flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
         </div>
         <div>
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-1">Security Integrity Active</h4>
            <p className="text-slate-400 text-[10px] font-bold leading-tight">All activity logs are encrypted and timestamped to ensure the absolute integrity of your learning record.</p>
         </div>
      </div>
    </div>
  );
};

export default Activity;
