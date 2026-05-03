import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, BookOpen, GraduationCap, UserCheck } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, trainers: 0, students: 0, courses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [ur, cr] = await Promise.all([api.get('/users'), api.get('/courses')]);
        const users = ur.data.users;
        setStats({
          users:    users.length,
          trainers: users.filter(u => u.role === 'trainer').length,
          students: users.filter(u => u.role === 'student').length,
          courses:  cr.data.courses.length,
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const cards = [
    { label: 'Total Users',   value: stats.users,    Icon: Users,         color: '#4f46e5', bg: '#e0e7ff' },
    { label: 'Trainers',      value: stats.trainers,  Icon: UserCheck,     color: '#0891b2', bg: '#e0f2fe' },
    { label: 'Students',      value: stats.students,  Icon: GraduationCap, color: '#059669', bg: '#d1fae5' },
    { label: 'Total Courses', value: stats.courses,   Icon: BookOpen,      color: '#d97706', bg: '#fef3c7' },
  ];

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="anim-fade">
      <div className="page-header">
        <div>
          <h2 className="page-title">Admin Dashboard</h2>
          <p className="page-sub">System overview and management</p>
        </div>
      </div>

      <div className="stats-grid">
        {cards.map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg }}><Icon size={22} color={color} /></div>
            <div>
              <div className="stat-val" style={{ color }}>{value}</div>
              <div className="stat-lbl">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { href: '/admin/users',    label: '→ Manage Users',   color: '#4f46e5' },
              { href: '/admin/courses',  label: '→ Manage Courses',  color: '#0891b2' },
              { href: '/admin/students', label: '→ Assign Courses',  color: '#059669' },
            ].map(({ href, label, color }) => (
              <a key={href} href={href} style={{ color, fontWeight: 600, fontSize: 14, padding: '10px 14px', display: 'block', borderRadius: 8, transition: 'background .2s' }}
                onMouseEnter={e => e.currentTarget.style.background = `${color}10`}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {label}
              </a>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>System Info</h3>
          {[['Admin ID','ADMIN-001'],['Version','1.0.0'],['Database','PostgreSQL (Neon)']].map(([k,v]) => (
            <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:14, padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
              <span style={{ color:'var(--text-2)' }}>{k}</span>
              <span style={{ fontWeight:600, color:'var(--text)' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
