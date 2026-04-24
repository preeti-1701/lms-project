import React, { useEffect, useState } from 'react';
import Layout from '../../components/shared/Layout';
import { StatCard, Spinner } from '../../components/shared/UI';
import api from '../../utils/api';

const adminNav = [
  { path: '/admin',label: 'Dashboard' },
  { path: '/admin/users', label: 'Users' },
  { path: '/admin/courses', label: 'Courses' },
  { path: '/admin/sessions',label: 'Active Sessions' },
  { path: '/admin/audit-logs', label: 'Audit Logs' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, coursesRes, sessionsRes] = await Promise.all([
          api.get('/users'),
          api.get('/courses'),
          api.get('/sessions'),
        ]);
        const users = usersRes.data.data;
        setStats({
          totalUsers: users.length,
          students: users.filter(u => u.role === 'student').length,
          trainers: users.filter(u => u.role === 'trainer').length,
          courses: coursesRes.data.data.length,
          activeSessions: sessionsRes.data.data.length,
        });
      } catch {}
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <Layout title="Dashboard" navItems={adminNav}>
      {loading ? <Spinner /> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
            <StatCard label="Total Users" value={stats?.totalUsers ?? 0} color="#6366f1" />
            <StatCard label="Students" value={stats?.students ?? 0} color="#10b981" />
            <StatCard label="Trainers" value={stats?.trainers ?? 0} color="#f59e0b" />
            <StatCard label="Courses" value={stats?.courses ?? 0} color="#3b82f6" />
            <StatCard label="Active Sessions" value={stats?.activeSessions ?? 0} color="#ef4444" />
          </div>

          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: 8 }}>Quick Actions</h2>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Use the sidebar to manage users, courses, monitor active sessions, and review audit logs.</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
              {[
                { href: '/admin/users', label: '+ Add User', color: '#6366f1' },
                { href: '/admin/courses', label: '+ Create Course', color: '#10b981' },
                { href: '/admin/sessions', label: 'View Sessions', color: '#f59e0b' },
              ].map(a => (
                <a key={a.href} href={a.href} style={{ padding: '8px 18px', background: a.color, color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
                  {a.label}
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
