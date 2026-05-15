import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TrainerLogin = () => {
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
      
      // Strict role check for Trainer Portal
      if (user.role !== 'trainer') {
        await logout(false);
        setError('Access Denied. This portal is for Trainers only.');
        setIsLoading(false);
        return;
      }

      navigate('/admin/courses');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-soft border border-slate-100 animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-amber-500 text-white flex items-center justify-center rounded-2xl mx-auto mb-4 font-black text-3xl shadow-lg shadow-amber-100">
            T
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Trainer Portal</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Course Management Access</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-8 text-sm font-bold border border-red-100 text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Trainer Email</label>
            <input
              type="email"
              required
              className="input-simple"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="trainer@lms.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
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
            className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black hover:bg-amber-600 transition-all shadow-xl shadow-amber-100 disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Sign In as Trainer'}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-50 text-center space-y-4">
          <p className="text-sm text-slate-600 font-medium">
            Want to teach?{' '}
            <button onClick={() => navigate('/trainer-register')} className="font-black text-amber-600 hover:underline">Apply as Trainer</button>
          </p>
          <button
            onClick={() => navigate('/login')}
            className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
          >
            &larr; Return to Student Portal
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainerLogin;
