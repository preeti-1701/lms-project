import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const styles = {
  wrapper: { display: 'flex', minHeight: '100vh', background: '#f5f7fa', fontFamily: "'Inter', sans-serif" },
  sidebar: { width: 240, background: '#1a1a2e', color: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  logo: { padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  logoTitle: { fontSize: '1.25rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' },
  logoSub: { fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.1em' },
  nav: { flex: 1, padding: '16px 0' },
  navItem: (active) => ({
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
    color: active ? '#fff' : 'rgba(255,255,255,0.6)',
    background: active ? 'rgba(99,102,241,0.3)' : 'transparent',
    borderLeft: active ? '3px solid #6366f1' : '3px solid transparent',
    textDecoration: 'none', fontSize: '0.875rem', fontWeight: active ? 600 : 400,
    transition: 'all 0.15s', cursor: 'pointer',
  }),
  userBox: { padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  userName: { fontSize: '0.875rem', fontWeight: 600, color: '#fff' },
  userRole: { fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 },
  logoutBtn: { marginTop: 12, width: '100%', padding: '8px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' },
  header: { background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  pageTitle: { fontSize: '1.125rem', fontWeight: 600, color: '#111827' },
  content: { flex: 1, padding: 32 },
};

export default function Layout({ title, navItems, children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={styles.wrapper}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoTitle}>🎓 LMS</div>
          <div style={styles.logoSub}>Learning Platform</div>
        </div>
        <nav style={styles.nav}>
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} style={styles.navItem(location.pathname === item.path || location.pathname.startsWith(item.path + '/'))}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div style={styles.userBox}>
          <div style={styles.userName}>{user?.name}</div>
          <div style={styles.userRole}>{user?.role}</div>
          <button style={styles.logoutBtn} onClick={handleLogout}>Sign Out</button>
        </div>
      </aside>
      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>{title}</h1>
        </div>
        <div style={styles.content}>{children}</div>
      </main>
    </div>
  );
}
