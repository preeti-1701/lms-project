import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, login } = useAuth(); // Use login to update user context
  const [stats, setStats] = useState(null);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/courses/stats/summary');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };
    fetchStats();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await api.put('/auth/profile', {
        name: profileData.name,
        email: profileData.email
      });
      // Update local storage and context
      const updatedUser = { ...user, name: profileData.name, email: profileData.email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Trigger a re-render/update in context if possible, or just show success
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header Profile Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
        <div className="p-10 flex flex-col md:flex-row md:items-center gap-10 relative z-10">
          <div className="w-28 h-28 rounded-3xl bg-slate-900 text-white flex items-center justify-center text-4xl font-black shadow-2xl group-hover:scale-105 transition-transform duration-500 border-4 border-slate-50">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-grow">
            <div className="flex flex-wrap items-center gap-4 mb-3">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{user?.name}</h1>
              <span className="px-3 py-1 bg-primary-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-primary-200">
                {user?.role}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-slate-500 font-bold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {user?.email}
              </div>
              <div className="flex items-center gap-2 text-slate-500 font-bold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                Verified Account
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {user?.role === 'admin' ? (
          <>
            <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-soft hover:shadow-lg transition-all group overflow-hidden relative">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Talent</p>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-black text-slate-900 tracking-tight">{stats?.totalUsers || 0}</p>
                  <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">LIVE</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-soft hover:shadow-lg transition-all group overflow-hidden relative">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Knowledge Assets</p>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-black text-slate-900 tracking-tight">{stats?.totalCourses || 0}</p>
                  <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">CATALOGED</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-soft hover:shadow-lg transition-all group overflow-hidden relative">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Platform Impact</p>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-black text-slate-900 tracking-tight">{stats?.totalEnrollments || 0}</p>
                  <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">ACTIVE SESSIONS</span>
                </div>
              </div>
            </div>
          </>
        ) : user?.role === 'trainer' ? (
          <>
            <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-soft hover:shadow-lg transition-all group overflow-hidden relative">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">My Curriculums</p>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-black text-slate-900 tracking-tight">{stats?.totalCourses || 0}</p>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">PUBLISHED</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-soft hover:shadow-lg transition-all group overflow-hidden relative">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Student Base</p>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-black text-slate-900 tracking-tight">{stats?.totalStudents || 0}</p>
                  <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">ENROLLED</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-soft hover:shadow-lg transition-all group overflow-hidden relative">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Lecture Assets</p>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-black text-slate-900 tracking-tight">{stats?.totalVideos || 0}</p>
                  <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">SECURE VIDEOS</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Enrolled Courses</p>
              <p className="text-2xl font-bold text-slate-900">{stats?.enrolledCount || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lessons Completed</p>
              <p className="text-2xl font-bold text-slate-900">{stats?.completedLessons || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Average Progress</p>
              <p className="text-2xl font-bold text-slate-900">{stats?.avgProgress || '0%'}</p>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-8 pb-4 border-b border-slate-100 flex items-center gap-2">
              Account Information
            </h2>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="input-simple"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                  <input 
                    type="email" 
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="input-simple"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary-simple h-11 px-8"
              >
                {loading ? 'Processing...' : 'Save Changes'}
              </button>
            </form>
          </section>

          <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-8 pb-4 border-b border-slate-100 flex items-center gap-2">
              Security & Credentials
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Password</label>
                <input 
                  type="password" 
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="input-simple"
                  placeholder="••••••••"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Password</label>
                  <input 
                    type="password" 
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="input-simple"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm Password</label>
                  <input 
                    type="password" 
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="input-simple"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary-simple h-11 px-8"
              >
                {loading ? 'Processing...' : 'Update Password'}
              </button>
            </form>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-[10px]">Account Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Status</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md font-black text-[9px]">ACTIVE</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Verified</span>
                <span className="text-slate-900 font-black">YES</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-4 border-t border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Member Since</span>
                <span className="text-slate-900 font-black tracking-tight">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </section>

          {user?.role === 'admin' && (
            <section className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary-600/20 transition-all"></div>
              <div className="relative z-10">
                <h3 className="font-black text-white mb-6 uppercase tracking-widest text-[10px]">Platform Integrity</h3>
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm">🛡️</div>
                    <div>
                      <p className="text-white text-[10px] font-black uppercase tracking-wider">Firewall Status</p>
                      <p className="text-emerald-400 text-[9px] font-bold">SECURE & ACTIVE</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm">👁️</div>
                    <div>
                      <p className="text-white text-[10px] font-black uppercase tracking-wider">Content Audit</p>
                      <p className="text-slate-400 text-[9px] font-bold">ALL NODES SYNCED</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Feedback Messages */}
          {success && (
            <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 p-4 rounded-xl flex items-center gap-3 animate-fade-in shadow-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 101.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              <span className="text-xs font-bold">{success}</span>
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3 animate-fade-in shadow-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              <span className="text-xs font-bold">{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
