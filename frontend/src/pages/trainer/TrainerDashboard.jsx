import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { BookOpen, Video, BarChart2, Hash, Copy, CheckCheck } from 'lucide-react';

const TrainerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ courses:0, published:0, videos:0 });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get('/courses').then(r => {
      const cs = r.data.courses;
      const videos = cs.reduce((s, c) => s + (c.videos?.length || 0), 0);
      setStats({ courses: cs.length, published: cs.filter(c => c.is_published).length, videos });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const copyId = () => {
    navigator.clipboard.writeText(user?.static_user_id || '');
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const cards = [
    { label:'My Courses',   value:stats.courses,   Icon:BookOpen,  color:'#4f46e5', bg:'#e0e7ff' },
    { label:'Published',    value:stats.published,  Icon:BarChart2, color:'#059669', bg:'#d1fae5' },
    { label:'Total Videos', value:stats.videos,     Icon:Video,     color:'#0891b2', bg:'#e0f2fe' },
  ];

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="anim-fade">
      <div className="page-header">
        <div>
          <h2 className="page-title">Trainer Dashboard</h2>
          <p className="page-sub">Manage your courses and content</p>
        </div>
      </div>

      {user?.static_user_id && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, background:'linear-gradient(135deg,#e0e7ff,#e0f2fe)', border:'1px solid rgba(79,70,229,.2)', borderRadius:14, padding:'18px 24px', marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:46, height:46, borderRadius:12, background:'#c7d2fe', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Hash size={20} color="#4f46e5" />
            </div>
            <div>
              <div style={{ fontSize:12, color:'#5c6f94', fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em' }}>Your Trainer ID — share with students</div>
              <div style={{ fontSize:30, fontWeight:900, color:'#4f46e5', fontFamily:'Outfit' }}>{user.static_user_id}</div>
            </div>
          </div>
          <button onClick={copyId} style={{ display:'flex', alignItems:'center', gap:7, background:copied?'#d1fae5':'white', border:`1px solid ${copied?'#6ee7b7':'rgba(79,70,229,.3)'}`, color:copied?'#059669':'#4f46e5', padding:'8px 18px', borderRadius:10, fontWeight:600, fontSize:14, cursor:'pointer', transition:'all .2s', boxShadow:'0 1px 3px rgba(0,0,0,.1)' }}>
            {copied ? <><CheckCheck size={15} /> Copied!</> : <><Copy size={15} /> Copy ID</>}
          </button>
        </div>
      )}

      <div className="stats-grid">
        {cards.map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background:bg }}><Icon size={22} color={color} /></div>
            <div><div className="stat-val" style={{ color }}>{value}</div><div className="stat-lbl">{label}</div></div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop:8 }}>
        <h3 style={{ fontSize:16, fontWeight:700, marginBottom:14 }}>Quick Start</h3>
        <p style={{ color:'var(--text-2)', fontSize:14, lineHeight:2 }}>
          📚 Go to <a href="/trainer/courses"><strong>My Courses</strong></a> to create a new course.<br />
          🎬 Add YouTube video links to each course (youtube.com or youtu.be).<br />
          ✅ Publish a course to make it visible to enrolled students.<br />
          👥 Visit <a href="/trainer/students"><strong>Students</strong></a> to assign courses to learners.
        </p>
      </div>
    </div>
  );
};

export default TrainerDashboard;
