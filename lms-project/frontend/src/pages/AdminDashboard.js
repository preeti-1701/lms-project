import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Navbar from '../components/Navbar';
import CourseAssignmentModal from '../components/CourseAssignmentModal';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    if (activeTab === 'users') {
      const res = await api.get('/users');
      setUsers(res.data);
    } else if (activeTab === 'courses') {
      const res = await api.get('/courses');
      setCourses(res.data);
    } else if (activeTab === 'sessions') {
      const res = await api.get('/sessions');
      setSessions(res.data);
    }
  };

  const handleForceLogout = async (userId) => {
    await api.post(`/sessions/force-logout/${userId}`);
    fetchData();
  };

  const toggleUserStatus = async (user) => {
    await api.put(`/users/${user.id}`, { ...user, is_active: !user.is_active });
    fetchData();
  };

  const handleRemoveUser = async (userId) => {
    if (window.confirm('Are you sure you want to PERMANENTLY delete this user?')) {
      await api.delete(`/users/${userId}`);
      fetchData();
    }
  };

  return (
    <div className="bg-admin" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Navbar />
      <div className="dashboard-layout" style={{ flexGrow: 1 }}>
        <div className="sidebar">
          <h3>Admin Panel</h3>
          <nav style={{ marginTop: '2rem' }}>
            <button onClick={() => setActiveTab('users')} className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer' }}>Users</button>
            <button onClick={() => setActiveTab('courses')} className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer' }}>Courses</button>
            <button onClick={() => setActiveTab('sessions')} className={`nav-item ${activeTab === 'sessions' ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer' }}>Sessions</button>
          </nav>
        </div>
        <div className="main-content">
          <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management</h2>
          <div className="card" style={{ marginTop: '1rem' }}>
            {activeTab === 'users' && (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>{u.is_active ? 'Active' : 'Disabled'}</td>
                      <td>
                        <button onClick={() => toggleUserStatus(u)} className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: 'auto', marginRight: '0.5rem' }}>Toggle Status</button>
                        {u.role === 'student' && (
                          <button onClick={() => setSelectedUser(u)} className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: 'auto', marginRight: '0.5rem', background: '#4b5563' }}>Manage Courses</button>
                        )}
                        <button onClick={() => handleForceLogout(u.id)} className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: 'auto', marginRight: '0.5rem', background: 'var(--danger)' }}>Force Logout</button>
                        <button onClick={() => handleRemoveUser(u.id)} className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: 'auto', background: '#000' }}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {activeTab === 'courses' && (
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Creator</th>
                    <th>Videos</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(c => (
                    <tr key={c.id}>
                      <td>{c.title}</td>
                      <td>{c.creator_name}</td>
                      <td>{c.video_count}</td>
                      <td>{new Date(c.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {activeTab === 'sessions' && (
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>IP Address</th>
                    <th>Device</th>
                    <th>Status</th>
                    <th>Logged At</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(s => (
                    <tr key={s.id}>
                      <td>{s.name} ({s.email})</td>
                      <td>{s.ip_address}</td>
                      <td>{s.device_info}</td>
                      <td>{s.is_active ? 'Active' : 'Ended'}</td>
                      <td>{new Date(s.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      {selectedUser && (
        <CourseAssignmentModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      )}
    </div>
  );
};

export default AdminDashboard;
