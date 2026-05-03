import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Eye, EyeOff, UserPlus } from 'lucide-react';

const RegisterPage = () => {
  const [params] = useSearchParams();
  const role = params.get('role') || 'student';
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('All fields are required'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      const data = await register({ name: form.name, email: form.email, password: form.password, role });
      setSuccess(data.message || 'Registration successful! Please login.');
      setTimeout(() => navigate(`/login?role=${role}`), 2200);
    } catch (err) {
      if (err.response) setError(err.response.data?.message || `Error ${err.response.status}`);
      else if (err.request) setError('Cannot reach the server. Is the backend running?');
      else setError(err.message);
    } finally { setLoading(false); }
  };

  const roleLabel = role === 'trainer' ? 'Trainer' : 'Student';

  return (
    <div className="auth-page">
      <div className="auth-card anim-up" style={{ maxWidth: 480 }}>
        <div className="auth-logo">
          <BookOpen size={34} color="var(--primary)" style={{ marginBottom: 8 }} />
          <h1>LearnHub</h1>
        </div>
        <p className="auth-subtitle">
          Create your <strong style={{ color: 'var(--primary)' }}>{roleLabel}</strong> account
        </p>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" type="text" placeholder="John Doe" value={form.name} onChange={set('name')} />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
          </div>
          <div className="form-group">
            <label className="form-label">Password *</label>
            <div style={{ position: 'relative' }}>
              <input className="form-input" type={showPwd ? 'text' : 'password'} placeholder="Min 8 characters"
                value={form.password} onChange={set('password')} style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer' }}>
                {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <input className="form-input" type="password" placeholder="Re-enter password" value={form.confirm} onChange={set('confirm')} />
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? <div className="spinner" /> : <><UserPlus size={17} /> Create Account</>}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to={`/login?role=${role}`}>Sign in</Link>
        </div>
        <div className="auth-footer" style={{ marginTop: 6 }}>
          <Link to="/" style={{ color: 'var(--text-3)', fontSize: 13 }}>← Back to role selection</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
