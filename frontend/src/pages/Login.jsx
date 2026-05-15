import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const user = await login(email, password);
      
      // Role Check
      if (user.role !== 'student') {
        await logout(false);
        setError(`Unauthorized. ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}s must use their dedicated portal.`);
        setIsLoading(false);
        return;
      }

      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-10 bg-white rounded-xl shadow-sm border border-slate-200 animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-slate-900 text-white flex items-center justify-center rounded-xl mx-auto mb-4 font-bold text-2xl shadow-lg">
            L
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Sign in to LMS</h1>
          <p className="text-slate-500 text-sm mt-2">Enter your email and password to access your portal</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium border border-red-100 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Email Address</label>
            <input
              type="email"
              required
              className="input-simple"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">Password</label>
              <button type="button" className="text-xs font-semibold text-slate-500 hover:text-slate-900">Forgot password?</button>
            </div>
            <input
              type="password"
              required
              className="input-simple"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary-simple h-12"
          >
            {isLoading ? 'Processing...' : 'Sign in to LMS'}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 text-center space-y-4">
          <p className="text-sm text-slate-600">
            New to our platform?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="font-bold text-slate-900 hover:underline"
            >
              Create an account
            </button>
          </p>
          <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => navigate('/admin-login')}
              className="flex-1 text-[10px] font-black text-red-600 hover:bg-white px-3 py-2 rounded-lg border border-red-100 transition-all shadow-sm uppercase tracking-tighter"
            >
              Admin Access
            </button>
            <button
              type="button"
              onClick={() => navigate('/trainer-login')}
              className="flex-1 text-[10px] font-black text-amber-600 hover:bg-white px-3 py-2 rounded-lg border border-amber-100 transition-all shadow-sm uppercase tracking-tighter"
            >
              Trainer Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
