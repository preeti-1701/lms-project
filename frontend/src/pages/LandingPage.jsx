import { useNavigate } from 'react-router-dom';
import { BookOpen, Shield, GraduationCap, UserCheck } from 'lucide-react';

const roles = [
  { role: 'student', label: 'Student',       desc: 'Access your assigned courses and watch learning videos', Icon: GraduationCap, color: '#4f46e5', light: '#e0e7ff' },
  { role: 'trainer', label: 'Trainer',        desc: 'Create courses, add YouTube videos and manage students',  Icon: UserCheck,     color: '#0891b2', light: '#e0f2fe' },
  { role: 'admin',   label: 'Administrator',  desc: 'Full system control — manage users, roles and courses',   Icon: Shield,        color: '#059669', light: '#d1fae5' },
];

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="auth-page" style={{ flexDirection: 'column', gap: 48 }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', zIndex: 1, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg,#4f46e5,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(79,70,229,.25)' }}>
            <BookOpen size={30} color="white" />
          </div>
          <h1 style={{ fontFamily: "'Outfit'", fontSize: 42, fontWeight: 900, background: 'linear-gradient(135deg,#4f46e5,#0891b2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            LearnHub LMS
          </h1>
        </div>
        <p style={{ color: 'var(--text-2)', fontSize: 17, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
          A secure, modern Learning Management System.<br />
          <strong style={{ color: 'var(--text)' }}>Select your role</strong> to get started.
        </p>
      </div>

      {/* Role cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', gap: 24, width: '100%', maxWidth: 920, zIndex: 1, position: 'relative' }}>
        {roles.map(({ role, label, desc, Icon, color, light }) => (
          <div key={role} className="card"
            style={{ textAlign: 'center', padding: '36px 28px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 8px 28px ${color}22`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--sh-sm)'; }}
          >
            <div style={{ width: 72, height: 72, borderRadius: 20, background: light, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: `1.5px solid ${color}30` }}>
              <Icon size={32} color={color} />
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 700, marginBottom: 10, color: 'var(--text)' }}>{label}</h3>
            <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 24 }}>{desc}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); navigate(`/login?role=${role}`); }}>
                Login
              </button>
              {role !== 'admin' && (
                <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); navigate(`/register?role=${role}`); }}>
                  Register
                </button>
              )}
            </div>
          </div>
        ))}
      </div>


    </div>
  );
};

export default LandingPage;
