import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const resp = await api.post('/auth/register/', { 
          email, 
          password, 
          first_name: firstName,
          last_name: lastName,
          phone_number: phone,
          role 
      });
      // Optionally auto-login, or just redirect to login screen
      navigate('/login');
    } catch (err) {
      if (err.response && err.response.data && typeof err.response.data === 'object') {
        const errObj = err.response.data;
        const msgs = Object.keys(errObj).map(key => `${key}: ${errObj[key]}`);
        setError(msgs.join(' | '));
      } else {
        setError('Registration failed due to a server error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-4 py-10">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20 p-8 relative z-10 transition-all duration-300">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
            Create an Account
          </h1>
          <p className="text-gray-300 mt-2 font-medium tracking-wide">Join the Learning Management System</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border-l-4 border-red-500 text-red-100 p-3 mb-6 rounded-r-lg font-semibold animate-[pulse_1s_ease-in-out]">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="flex gap-4">
            <div className="space-y-2 flex-1">
                <label className="text-sm font-semibold text-gray-200 ml-1">First Name</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/10 transition-all" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="space-y-2 flex-1">
                <label className="text-sm font-semibold text-gray-200 ml-1">Last Name</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/10 transition-all" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-200 ml-1">Email</label>
            <input type="email" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/10 transition-all" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-200 ml-1">Phone Number</label>
            <input type="text" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/10 transition-all" placeholder="+123456789" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-200 ml-1">Your Role</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/10 transition-all appearance-none"
            >
              <option value="STUDENT" className="bg-gray-800 text-white">Student</option>
              <option value="TRAINER" className="bg-gray-800 text-white">Trainer</option>
              <option value="ADMIN" className="bg-gray-800 text-white">Admin</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-200 ml-1">Password</label>
            <input type="password" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/10 transition-all" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transform transition-all active:scale-95 flex justify-center mt-6 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <span className="flex items-center gap-2 tracking-wide font-medium">Creating account...</span>
            ) : (
              <span className="flex items-center gap-2">
                Register Now
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            )}
          </button>
          
          <div className="text-center pt-4">
             <p className="text-sm text-gray-400">
               Already have an account? <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">Sign in here</Link>
             </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
