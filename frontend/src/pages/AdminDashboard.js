import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState('courses');
  const email = localStorage.getItem('email');
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/users/', { headers }).then(r => setUsers(r.data)).catch(console.error);
    axios.get('http://127.0.0.1:8000/api/courses/', { headers }).then(r => setCourses(r.data)).catch(console.error);
    axios.get('http://127.0.0.1:8000/api/sessions/', { headers }).then(r => setSessions(r.data)).catch(console.error);
  }, []);

  const forceLogout = async (userId) => {
    await axios.post(`http://127.0.0.1:8000/api/force-logout/${userId}/`, {}, { headers });
    alert('User logged out!');
  };

  const logout = () => { localStorage.clear(); window.location.href = '/login'; };

  return (
    <div style={s.container}>
      <div style={s.sidebar}>
        <div style={s.logo}>L</div>
        <p style={s.logoText}>LMS 2026</p>
        {['courses', 'users', 'sessions'].map(tab => (
          <div key={tab} style={{ ...s.navItem, ...(activeTab === tab ? s.navActive : {}) }}
            onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </div>
        ))}
        <div style={s.navItem} onClick={logout}>Logout</div>
        <p style={s.userEmail}>{email}</p>
      </div>
      <div style={s.main}>
        <h2 style={s.pageTitle}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
        {activeTab === 'courses' && (
          <div style={s.grid}>
            {courses.length === 0 && <p style={s.empty}>No courses yet. Add them via Django admin.</p>}
            {courses.map(c => (
              <div key={c.id} style={s.card}>
                <span style={{ ...s.badge, background: c.status === 'active' ? '#E1F5EE' : '#f0f0f0', color: c.status === 'active' ? '#0F6E56' : '#666' }}>{c.status}</span>
                <h3 style={s.cardTitle}>{c.title}</h3>
                <p style={s.cardSub}>{c.videos?.length || 0} videos</p>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'users' && (
          <table style={s.table}>
            <thead><tr>{['Email', 'Role', 'Status', 'Action'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={s.td}>{u.email}</td>
                  <td style={s.td}>{u.role}</td>
                  <td style={s.td}><span style={{ ...s.badge, background: u.is_active ? '#E1F5EE' : '#fff0f0', color: u.is_active ? '#0F6E56' : '#c0392b' }}>{u.is_active ? 'Active' : 'Disabled'}</span></td>
                  <td style={s.td}><button style={s.btn} onClick={() => forceLogout(u.id)}>Force Logout</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {activeTab === 'sessions' && (
          <table style={s.table}>
            <thead><tr>{['User', 'IP', 'Device', 'Action'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {sessions.length === 0 && <tr><td style={s.td} colSpan="4">No active sessions</td></tr>}
              {sessions.map(sess => (
                <tr key={sess.id}>
                  <td style={s.td}>{sess.user_email}</td>
                  <td style={s.td}>{sess.ip_address}</td>
                  <td style={s.td}>{sess.device_info?.substring(0, 50)}</td>
                  <td style={s.td}><button style={s.btn} onClick={() => forceLogout(sess.user)}>Force Logout</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const s = {
  container: { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  sidebar: { width: 200, background: '#fff', padding: 20, borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: 4 },
  logo: { width: 36, height: 36, background: '#1D9E75', borderRadius: 8, color: '#fff', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontWeight: 700, fontSize: 15, color: '#1a1a1a', margin: '4px 0 16px' },
  navItem: { padding: '8px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: '#555' },
  navActive: { background: '#E1F5EE', color: '#0F6E56', fontWeight: 600 },
  userEmail: { fontSize: 11, color: '#999', marginTop: 'auto', wordBreak: 'break-all' },
  main: { flex: 1, padding: 28 },
  pageTitle: { fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 20 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 },
  card: { background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #eee' },
  cardTitle: { fontSize: 15, fontWeight: 600, color: '#1a1a1a', margin: '8px 0 4px' },
  cardSub: { fontSize: 12, color: '#888' },
  badge: { fontSize: 11, padding: '2px 10px', borderRadius: 20, fontWeight: 600 },
  table: { width: '100%', background: '#fff', borderRadius: 12, borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#888', borderBottom: '1px solid #eee', fontWeight: 600 },
  td: { padding: '12px 16px', fontSize: 13, color: '#333', borderBottom: '1px solid #f5f5f5' },
  btn: { fontSize: 12, padding: '4px 12px', borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer', background: '#fff', color: '#c0392b' },
  empty: { color: '#888', fontSize: 14 },
};

export default AdminDashboard;
