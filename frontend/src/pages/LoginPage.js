import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      // We ignore the dropdown 'role' state here and use the actual role from the DB
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'trainer') navigate('/trainer');
      else navigate('/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>LMS Login</h2>
        {error && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email / Mobile</label>
            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@lms.com" />
          </div>
          <div className="form-group">
            <label>Login as</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: '#fff' }}>
              <option value="student">Student</option>
              <option value="trainer">Trainer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-group" style={{ position: 'relative' }}>
            <label>Password</label>
            <input 
              type={showPassword ? 'text' : 'password'} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••" 
            />
            <div 
              onClick={() => setShowPassword(!showPassword)}
              style={{ 
                position: 'absolute', 
                right: '10px', 
                top: '38px', 
                cursor: 'pointer',
                fontSize: '0.75rem',
                color: 'var(--primary)',
                fontWeight: '600'
              }}
            >
              {showPassword ? 'HIDE' : 'SHOW'}
            </div>
          </div>
          <button type="submit" className="btn">Login</button>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Register</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
