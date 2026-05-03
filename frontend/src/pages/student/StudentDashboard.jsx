import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Play, BookOpen, Video, GraduationCap } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data.courses)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const greetHour = new Date().getHours();
  const greeting = greetHour < 12 ? 'Good morning' : greetHour < 18 ? 'Good afternoon' : 'Good evening';
  const totalVideos = courses.reduce((s, c) => s + (c.videos?.length || 0), 0);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="anim-fade">
      {/* Hero greeting */}
      <div style={{ background:'linear-gradient(135deg,#e0e7ff,#e0f2fe)', border:'1px solid rgba(79,70,229,.15)', borderRadius:18, padding:'28px 32px', marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:'linear-gradient(135deg,#4f46e5,#0891b2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:900, color:'white', boxShadow:'0 4px 14px rgba(79,70,229,.3)' }}>
            {user?.name?.[0]?.toUpperCase() || 'S'}
          </div>
          <div>
            <h2 style={{ fontSize:22, fontWeight:800, color:'#1e2a45' }}>{greeting}, {user?.name?.split(' ')[0]}! 👋</h2>
            <p style={{ color:'#5c6f94', fontSize:14, marginTop:2 }}>
              ID: <strong style={{ color:'#4f46e5' }}>{user?.static_user_id}</strong> · {courses.length} course{courses.length !== 1 ? 's' : ''} assigned
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom:28 }}>
        {[
          { label:'My Courses',   value:courses.length, Icon:BookOpen, color:'#4f46e5', bg:'#e0e7ff' },
          { label:'Total Videos', value:totalVideos,    Icon:Video,    color:'#0891b2', bg:'#e0f2fe' },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background:bg }}><Icon size={22} color={color} /></div>
            <div><div className="stat-val" style={{ color }}>{value}</div><div className="stat-lbl">{label}</div></div>
          </div>
        ))}
      </div>

      {/* Courses */}
      <h3 style={{ fontSize:17, fontWeight:700, marginBottom:16 }}>My Courses</h3>
      {courses.length === 0 ? (
        <div className="empty">
          <GraduationCap style={{ width:64, height:64 }} />
          <h3>No courses yet</h3>
          <p>Your trainer or admin will assign courses to you. You can also browse available courses.</p>
          <button className="btn btn-primary" style={{ marginTop:16 }} onClick={() => navigate('/student/browse')}>Browse Courses</button>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.slice(0,6).map(c => (
            <div key={c.id} className="course-card" onClick={() => navigate(`/student/course/${c.id}`)}>
              <div className="course-thumb">
                <span className="course-thumb-emoji">📖</span>
                {c.category && <span className="badge badge-primary" style={{ position:'absolute', top:12, left:12 }}>{c.category}</span>}
              </div>
              <div className="course-body">
                <div className="course-title">{c.title}</div>
                <div className="course-desc">{c.description || 'No description'}</div>
                <div className="course-meta">
                  <span>🎬 {c.videos?.length || 0} videos</span>
                  {c.trainer && <span>👤 {c.trainer.name}</span>}
                </div>
                <button className="btn btn-primary w-full" style={{ marginTop:14 }} onClick={e => { e.stopPropagation(); navigate(`/student/course/${c.id}`); }}>
                  <Play size={15} /> Start Learning
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
