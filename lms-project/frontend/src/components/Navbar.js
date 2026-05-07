import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '1rem 2rem', 
      background: '#fff', 
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ fontWeight: '700', fontSize: '1.25rem', color: 'var(--primary)' }}>
        Secure LMS
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{user.name}</div>
          <div style={{ 
            fontSize: '0.7rem', 
            color: '#fff', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            fontWeight: '800',
            background: user.role === 'admin' ? '#ef4444' : (user.role === 'trainer' ? '#3b82f6' : '#10b981'),
            padding: '2px 8px',
            borderRadius: '10px',
            marginTop: '2px',
            display: 'inline-block'
          }}>
            {user.role} PANEL
          </div>
        </div>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '50%', 
          background: 'var(--primary)', 
          color: '#fff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontWeight: '700'
        }}>
          {user.name.charAt(0)}
        </div>
        <button 
          onClick={handleLogout}
          style={{ 
            padding: '0.5rem 1rem', 
            borderRadius: '0.5rem', 
            border: '1px solid var(--danger)', 
            color: 'var(--danger)',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
