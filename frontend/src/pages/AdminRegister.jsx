import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminRegister = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/auth/register', formData);
      alert('Admin registration successful. You can now login.');
      navigate('/admin-login');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-soft border border-slate-100 animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-red-600 text-white flex items-center justify-center rounded-2xl mx-auto mb-4 font-black text-3xl shadow-lg shadow-red-100">
            A
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Sign Up</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Initialize System Authority</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-8 text-sm font-bold border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
            <input
              type="text"
              required
              className="input-simple"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Master Administrator"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Admin Email</label>
            <input
              type="email"
              required
              className="input-simple"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="admin@lms.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Secure Password</label>
            <input
              type="password"
              required
              className="input-simple"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all shadow-xl shadow-red-100 disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Initialize Administrator'}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
          <button
            onClick={() => navigate('/admin-login')}
            className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            Already have admin access? <span className="text-red-600 font-black">Login here</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
