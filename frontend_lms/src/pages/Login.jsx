import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const resp = await api.post('/auth/login/', { email, password });
      localStorage.setItem('access_token', resp.data.access);
      localStorage.setItem('refresh_token', resp.data.refresh);
      localStorage.setItem('user', JSON.stringify(resp.data.user));
      
      const role = resp.data.user.role;
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'TRAINER') navigate('/trainer');
      else navigate('/student');

    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-4">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20 p-8 relative z-10 transition-all duration-300 hover:shadow-[0_8px_40px_0_rgba(100,100,255,0.3)]">
        
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-cyan-400 to-purple-400 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-cyan-400/30 mb-4 animate-[bounce_3s_ease-in-out_infinite]">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
            LMS Portal
          </h1>
          <p className="text-gray-300 mt-2 font-medium tracking-wide">Secure Learning Environment</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border-l-4 border-red-500 text-red-100 p-3 mb-6 rounded-r-lg font-semibold animate-[pulse_1s_ease-in-out]">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-200 ml-1">Email or Phone Number</label>
            <input 
              type="text" 
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/10 transition-all"
              placeholder="Enter your email or phone"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-200 ml-1">Password</label>
            <input 
              type="password" 
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/10 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transform transition-all active:scale-95 flex justify-center mt-8 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <span className="flex items-center gap-2">
                Secure Login
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            )}
          </button>

          <div className="text-center pt-4">
             <p className="text-sm text-gray-400">
               Don't have an account? <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">Sign up here</Link>
             </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
