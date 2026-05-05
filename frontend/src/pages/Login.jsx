import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);
  const { login, isSessionExpired } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for session expired on mount
  useEffect(() => {
    // Check URL param or session storage
    const expired = searchParams.get('expired') === 'true' || isSessionExpired();
    if (expired) {
      setSessionExpired(true);
      setError('Your session has expired. You were logged in from another device.');
    }
  }, [searchParams, isSessionExpired]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : user.role === 'trainer' ? '/trainer' : '/student');
    } catch (err) {
      // Handle specific error messages
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Invalid email or password');
      }
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>LMS Login</h1>
        
        {/* Session expired warning */}
        {sessionExpired && (
          <div className="session-expired-warning">
            ⚠️ Your previous session was ended because you logged in from another device.
          </div>
        )}
        
        {error && <div className="error">{error}</div>}
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>

      <style>{`
        .session-expired-warning {
          background: #fff3cd;
          color: #856404;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 15px;
          font-size: 13px;
          text-align: center;
          border: 1px solid #ffeeba;
        }
      `}</style>
    </div>
  );
}
