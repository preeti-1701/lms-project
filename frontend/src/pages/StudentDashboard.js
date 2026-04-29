import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const email = localStorage.getItem('email');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/my-courses/', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => { setCourses(r.data); setLoading(false); })
    .catch((err) => {
      if (err.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }
      setLoading(false);
    });
  }, []);

  


  const logout = () => { localStorage.clear(); window.location.href = '/login'; };

  return (
    <div style={s.container}>
      <div style={s.topbar}>
        <div style={s.logoRow}>
          <div style={s.logo}>L</div>
          <span style={s.logoText}>LMS 2026</span>
        </div>
        <div style={s.right}>
          <span style={s.email}>{email}</span>
          <button style={s.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </div>
      <div style={s.content}>
        <h2 style={s.title}>My Courses</h2>
        {loading && <p style={s.empty}>Loading...</p>}
        {!loading && courses.length === 0 && <p style={s.empty}>No courses assigned yet. Contact your admin.</p>}
        <div style={s.grid}>
          {courses.map(c => (
            <div key={c.id} style={s.card}>
              <span style={s.badge}>{c.status}</span>
              <h3 style={s.cardTitle}>{c.title}</h3>
              <p style={s.cardSub}>{c.description}</p>
              <p style={s.videoCount}>{c.videos?.length || 0} videos</p>
              <div style={s.videoList}>
                {c.videos?.map(v => (
                  <div key={v.id} style={s.videoItem}
                    onClick={() => navigate(`/video/${v.id}`, { state: { video: v, courseTitle: c.title } })}>
                    <div style={s.playIcon}>▶</div>
                    <p style={s.videoTitle}>{v.title}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  container: { minHeight: '100vh', background: '#f0f4f8' },
  topbar: { background: '#fff', padding: '12px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee' },
  logoRow: { display: 'flex', alignItems: 'center', gap: 10 },
  logo: { width: 32, height: 32, background: '#1D9E75', borderRadius: 8, color: '#fff', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontWeight: 700, fontSize: 16, color: '#1a1a1a' },
  right: { display: 'flex', alignItems: 'center', gap: 16 },
  email: { fontSize: 13, color: '#666' },
  logoutBtn: { padding: '6px 14px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 13 },
  content: { padding: 28 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 20 },
  empty: { color: '#888', fontSize: 14 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  card: { background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #eee' },
  badge: { fontSize: 11, padding: '2px 10px', borderRadius: 20, background: '#E1F5EE', color: '#0F6E56', fontWeight: 600 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: '10px 0 4px' },
  cardSub: { fontSize: 13, color: '#888', margin: '0 0 8px' },
  videoCount: { fontSize: 12, color: '#aaa', marginBottom: 12 },
  videoList: { display: 'flex', flexDirection: 'column', gap: 8 },
  videoItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: '#f8f9fa', cursor: 'pointer' },
  playIcon: { width: 28, height: 28, background: '#1D9E75', borderRadius: '50%', color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  videoTitle: { fontSize: 13, color: '#333', margin: 0 },
};

export default StudentDashboard;