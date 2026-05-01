import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

function Login({ setUser }) {

  // ==========================Navigation==========================
  const navigate = useNavigate();

  // ==========================State==========================
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');



  // =========================Login Handler==========================
  const handleLogin = async () => {

    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    // ✅ Clear old tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('session_token');

    try {

      const response = await api.post('/api/login/', {
        username,
        password
      });

      console.log("Login response:", response.data);

      // ✅ Store ALL tokens FIRST
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('session_token', response.data.session_token);
      localStorage.setItem('user', JSON.stringify(response.data));

      console.log("Saved session_token:", localStorage.getItem('session_token'));

      // ✅ Update state
      setUser(response.data);

      alert("Login successful: " + response.data.role);

      setTimeout(() => {

        // ✅ Single navigation (NO setTimeout needed)
        if (response.data.role === 'admin') {
          navigate('/admin');
        }
        else if (response.data.role === 'trainer') {
          navigate('/trainer');
        }
        else {
          navigate('/student');
        }
      }, 150);


    } catch (error) {

      console.error("Login error:", error?.response || error);

      alert(
        error?.response?.data?.error ||
        "Invalid login"
      );

    }
  };

  // ==========================Back Handler==========================
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/');
  };



  // ==========================UI==========================
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent opacity-30 pointer-events-none" />

      {/* Back button */}
      <div className="absolute top-8 left-8 z-20">
        <button
          onClick={handleBack}
          className="px-4 py-2 text-slate-300 hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2"
        >
          ← Back
        </button>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                SecureLearn
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-2">LMS Login</p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter your username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none transition-all duration-300"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none transition-all duration-300"
              />
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              className="w-full px-4 py-3 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 mt-6"
            >
              Sign In
            </button>
          </div>

          {/* Footer Text */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-slate-400 text-sm">
              Secure Learning Management System
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-6">
          <p className="text-slate-400 text-sm">
            Demo Credentials:
            <br />
            <span className="text-cyan-400 font-medium">student / password123</span>
          </p>
        </div>
      </div>
    </div>
  );

}

export default Login;