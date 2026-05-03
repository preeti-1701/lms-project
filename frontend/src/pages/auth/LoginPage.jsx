import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Eye, EyeOff, LogIn } from 'lucide-react';

const roleLabels = { admin: 'Administrator', trainer: 'Trainer', student: 'Student' };

const LoginPage = () => {
  const [params] = useSearchParams();
  const role = params.get('role') || 'student';
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!email || !password) { setError('Email and password are required'); return; }
    setLoading(true); setError('');
    try {
      const user = await login(email, password);
      const map = { admin: '/admin/dashboard', trainer: '/trainer/dashboard', student: '/student/dashboard' };
      navigate(map[user.role] || '/');
    } catch (err) {
      if (err.response) setError(err.response.data?.message || `Error ${err.response.status}`);
      else if (err.request) setError('Cannot reach the server. Is the backend running on port 5001?');
      else setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card anim-up">
        <div className="auth-logo">
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#4f46e5,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 4px 14px rgba(79,70,229,.3)' }}>
            <BookOpen size={26} color="white" />
          </div>
          <h1>LearnHub</h1>
        </div>
        <p className="auth-subtitle">
          Sign in as <strong style={{ color: 'var(--primary)' }}>{roleLabels[role]}</strong>
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="lms-email">Email Address</label>
            <input
              id="lms-email"
              className="form-input"
              type="text"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="lms-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="lms-password"
                className="form-input"
                type={showPwd ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}>
                {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button type="submit" id="lms-signin-btn" className="btn btn-primary btn-lg w-full" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? <div className="spinner" style={{ borderColor: 'rgba(255,255,255,.3)', borderTopColor: 'white' }} /> : <><LogIn size={17} /> Sign In</>}
          </button>
        </form>

        {role !== 'admin' && (
          <div className="auth-footer">
            Don't have an account? <Link to={`/register?role=${role}`}>Register</Link>
          </div>
        )}
        <div className="auth-footer" style={{ marginTop: 8 }}>
          <Link to="/" style={{ color: 'var(--text-3)', fontSize: 13 }}>← Back to role selection</Link>
        </div>

        {role === 'admin' && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0', fontSize: 13, color: '#166534' }}>
            🔑 <strong>Admin credentials:</strong><br />
            Email: <code style={{ background: '#dcfce7', padding: '1px 5px', borderRadius: 4 }}>admin@lms.com</code>&nbsp;|&nbsp;
            Password: <code style={{ background: '#dcfce7', padding: '1px 5px', borderRadius: 4 }}>Admin@1234</code>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
