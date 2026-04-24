import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7fa', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '5rem', marginBottom: 16 }}>🔍</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', marginBottom: 8 }}>404 — Page Not Found</h1>
        <p style={{ color: '#6b7280', marginBottom: 24 }}>The page you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/')} style={{ padding: '10px 24px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
          Go Home
        </button>
      </div>
    </div>
  );
}
