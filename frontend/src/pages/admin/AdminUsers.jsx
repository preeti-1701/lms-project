import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';

const AdminUsers = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get('role') || '';

  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [showSessions, setShowSessions] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState(initialRole);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [editData, setEditData] = useState({ id: '', name: '', role: '', status: '' });
  
  // Enrollment State
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, []);

  const fetchActiveSessions = async () => {
    try {
      const res = await api.get('/users/sessions/active');
      setSessions(res.data);
      setShowSessions(true);
    } catch (err) {
      showNotification('Failed to fetch active sessions', 'error');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data);
    } catch (err) {
      console.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg, type = 'success') => {
    if (type === 'success') setSuccess(msg);
    else setError(msg);
    setTimeout(() => {
      setSuccess('');
      setError('');
    }, 4000);
  };

  const handleEnroll = async () => {
    if (!selectedCourse) return alert('Please select a course');
    try {
      await api.post(`/users/${selectedUser.id}/enroll/${selectedCourse}`);
      showNotification(`Enrolled ${selectedUser.name} successfully!`);
      setShowEnrollModal(false);
      setSelectedUser(null);
      setSelectedCourse('');
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to enroll student', 'error');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      setFormData({ name: '', email: '', password: '', role: 'student' });
      setShowAddForm(false);
      fetchUsers();
      showNotification('User created successfully');
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to create user', 'error');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${editData.id}`, editData);
      setShowEditModal(false);
      fetchUsers();
      showNotification('User updated successfully');
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to update user', 'error');
    }
  };

  const toggleUserStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'disabled' : 'active';
    try {
      await api.patch(`/users/${user.id}/status`, { status: newStatus });
      fetchUsers();
      showNotification(`User ${user.name} is now ${newStatus}`);
    } catch (err) {
      showNotification('Failed to change user status', 'error');
    }
  };

  const handleForceLogout = async (id, name) => {
    if (window.confirm(`Are you sure you want to force logout ${name}? This will invalidate all their active sessions.`)) {
      try {
        await api.post(`/users/${id}/force-logout`);
        showNotification(`${name} has been forced to logout.`);
      } catch (err) {
        showNotification('Failed to force logout user', 'error');
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
        showNotification('User deleted successfully');
      } catch (err) {
        showNotification('Failed to delete user', 'error');
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Personnel Data...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Personnel Control</h1>
          <p className="text-slate-500 font-medium mt-1">Manage system access, roles, and course assignments</p>
        </div>
        <div className="flex gap-3">
          <div className="relative group flex-grow md:flex-grow-0">
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Filter by name, email or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-80 pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all shadow-sm"
            />
          </div>
          <button
            onClick={() => { fetchActiveSessions(); }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            Active Sessions
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${
              showAddForm
              ? 'bg-white text-slate-900 border border-slate-200'
              : 'bg-slate-900 text-white hover:bg-black'
            }`}
          >
            {showAddForm ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            )}
            {showAddForm ? 'Cancel' : 'Register New User'}
          </button>
        </div>
      </div>

      {/* ── Active Sessions Panel ─────────────────────────────────── */}
      {showSessions && (
        <div className="bg-slate-900 rounded-2xl p-6 mb-8 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
              Live Active Sessions ({sessions.length})
            </h2>
            <button onClick={() => setShowSessions(false)} className="text-slate-400 hover:text-white text-xs font-bold">✕ Close</button>
          </div>
          {sessions.length === 0 ? (
            <p className="text-slate-400 text-sm">No active sessions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="pb-3 text-slate-400 text-xs font-bold uppercase tracking-wider pr-6">User</th>
                    <th className="pb-3 text-slate-400 text-xs font-bold uppercase tracking-wider pr-6">Role</th>
                    <th className="pb-3 text-slate-400 text-xs font-bold uppercase tracking-wider pr-6">IP Address</th>
                    <th className="pb-3 text-slate-400 text-xs font-bold uppercase tracking-wider pr-6">Device / Browser</th>
                    <th className="pb-3 text-slate-400 text-xs font-bold uppercase tracking-wider pr-6">Login Time</th>
                    <th className="pb-3 text-slate-400 text-xs font-bold uppercase tracking-wider">Last Seen</th>
                    <th className="pb-3 text-slate-400 text-xs font-bold uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sessions.map((s) => (
                    <tr key={s.session_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 pr-6">
                        <p className="text-white font-semibold">{s.user_name}</p>
                        <p className="text-slate-400 text-xs">{s.user_email}</p>
                      </td>
                      <td className="py-3 pr-6">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          s.role === 'admin' ? 'bg-red-900/50 text-red-400' :
                          s.role === 'trainer' ? 'bg-amber-900/50 text-amber-400' :
                          'bg-blue-900/50 text-blue-400'
                        }`}>{s.role}</span>
                      </td>
                      <td className="py-3 pr-6">
                        <span className="font-mono text-emerald-400 text-xs bg-emerald-900/20 px-2 py-1 rounded">{s.ip_address || 'N/A'}</span>
                      </td>
                      <td className="py-3 pr-6 max-w-[200px]">
                        <p className="text-slate-300 text-xs truncate" title={s.device_info}>{s.device_info || 'Unknown'}</p>
                      </td>
                      <td className="py-3 pr-6">
                        <p className="text-slate-300 text-xs">{s.login_time ? new Date(s.login_time).toLocaleString() : '-'}</p>
                      </td>
                      <td className="py-3 pr-6">
                        <p className="text-slate-300 text-xs">{s.last_seen ? new Date(s.last_seen).toLocaleString() : '-'}</p>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleForceLogout(s.user_id, s.user_name)}
                          className="px-3 py-1 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg text-xs font-bold hover:bg-red-600/40 transition-all"
                        >
                          Force Logout
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Notifications */}
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold border border-red-100 flex items-center gap-3 animate-slide-up">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
        {error}
      </div>}
      
      {success && <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl mb-6 text-sm font-bold border border-emerald-100 flex items-center gap-3 animate-slide-up">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
        {success}
      </div>}

      {/* Add User Form */}
      {showAddForm && (
        <div className="bg-white p-8 rounded-2xl shadow-soft border border-slate-200 mb-8 animate-slide-down">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Create New Account</h2>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-simple" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-simple" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Initial Password</label>
              <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="input-simple" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Access Role</label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="input-simple">
                <option value="student">Student</option>
                <option value="trainer">Trainer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-4 pt-4">
              <button type="submit" className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-md">Complete Registration</button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-[2rem] shadow-soft border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">User Information</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Permissions</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Safety Status</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">System Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      user.role === 'admin' ? 'bg-red-50 text-red-600' : 
                      user.role === 'trainer' ? 'bg-amber-50 text-amber-600' : 
                      'bg-primary-50 text-primary-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => toggleUserStatus(user)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all hover:scale-105 ${
                        user.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-red-50 text-red-600 border border-red-100'
                      }`}
                    >
                      {user.status}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {user.role === 'student' && (
                        <button 
                          onClick={() => { setSelectedUser(user); setShowEnrollModal(true); }} 
                          title="Enroll in Course"
                          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" /></svg>
                        </button>
                      )}
                      <button 
                        onClick={() => { setEditData(user); setShowEditModal(true); }}
                        title="Edit User"
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                      </button>
                      <button 
                        onClick={() => handleForceLogout(user.id, user.name)}
                        title="Force Logout"
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        title="Delete User"
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-slide-up">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Update Credentials</h2>
            <form onSubmit={handleUpdateUser} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Display Name</label>
                <input type="text" required value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="input-simple" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Access Role</label>
                <select value={editData.role} onChange={e => setEditData({...editData, role: e.target.value})} className="input-simple">
                  <option value="student">Student</option>
                  <option value="trainer">Trainer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-md">Apply Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enrollment Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-slide-up">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Assign Course</h2>
            <p className="mb-6 text-slate-500 font-medium leading-relaxed">
              Grant <strong>{selectedUser?.name}</strong> access to the following learning module:
            </p>
            <select 
              className="input-simple mb-8"
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
            >
              <option value="">-- Choose Module --</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => { setShowEnrollModal(false); setSelectedUser(null); }}
                className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleEnroll}
                className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-md shadow-primary-200"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
