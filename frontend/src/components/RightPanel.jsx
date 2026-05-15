import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const RightPanel = () => {
  const [trainers, setTrainers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trainersRes, activityRes] = await Promise.all([
          api.get('/courses/my-trainers'),
          api.get('/courses/activity/recent')
        ]);
        setTrainers(trainersRes.data);
        setActivities(activityRes.data);
      } catch (err) {
        console.error('Failed to fetch panel data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatTime = (dateStr) => {
    if (!dateStr) return 'Recently';
    const now = new Date();
    const past = new Date(dateStr);
    const diffInMs = now - past;
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    if (diffInHours > 0) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInMins > 0) return `${diffInMins} minute${diffInMins > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getActivityIcon = (type) => {
    if (type === 'Lesson Completed') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    if (type === 'New Course') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  const handleActivityClick = (activity) => {
    if (activity.type === 'Lesson Completed' && activity.course_id && activity.video_id) {
      navigate(`/course/${activity.course_id}/video/${activity.video_id}`);
    } else if (activity.course_id) {
      navigate(`/course/${activity.course_id}`);
    }
  };

  return (
    <aside className="space-y-8 animate-slide-right">
      {/* Your Instructors */}
      <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Your Instructors</h3>
          <button className="text-primary-600 text-[10px] font-bold uppercase hover:underline">View All</button>
        </div>
        <div className="space-y-4">
          {trainers.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
              <p className="text-xs text-slate-400 italic">Enroll in a course to connect with mentors.</p>
            </div>
          ) : (
            trainers.slice(0, 3).map((trainer, index) => (
              <div key={trainer.id} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/100?img=${index + 30}`} alt={trainer.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{trainer.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Expert Mentor</p>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Activity</h3>
        <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
          {activities.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-2xl text-center relative z-10 border border-dashed border-slate-200">
              <p className="text-xs text-slate-400 italic">No recent activity yet. Start learning!</p>
            </div>
          ) : (
            activities.map((activity, idx) => (
              <ActivityItem 
                key={idx}
                title={activity.type} 
                desc={activity.title} 
                time={formatTime(activity.timestamp)} 
                icon={getActivityIcon(activity.type)} 
                color={activity.type === 'Lesson Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-primary-50 text-primary-600'} 
                onClick={() => handleActivityClick(activity)}
              />
            ))
          )}
        </div>
      </section>
    </aside>
  );
};

const ActivityItem = ({ title, desc, time, icon, color, onClick }) => (
  <div 
    onClick={onClick}
    className="flex gap-4 relative z-10 group cursor-pointer hover:bg-slate-50/50 p-2 -m-2 rounded-2xl transition-all"
  >
    <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-lg flex-shrink-0 shadow-sm border border-white group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <div className="overflow-hidden">
      <p className="text-sm font-bold text-slate-900 truncate group-hover:text-primary-600 transition-colors">{title}</p>
      <p className="text-xs text-slate-500 truncate mb-1 font-medium">{desc}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{time}</p>
    </div>
  </div>
);

export default RightPanel;
