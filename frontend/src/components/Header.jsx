import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="animate-fade-in">
        <h2 className="text-xl font-black text-slate-900 leading-tight">
          {user?.role === 'admin' ? 'Systems Overview' : `Welcome back, ${user?.name || 'Learner'} 👋`}
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          {user?.role === 'admin' ? 'Administrative Control & Analytics' : "Keep learning, you're doing great!"}
        </p>
      </div>

      <div className="flex items-center gap-8">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
              setSearchQuery('');
            }
          }}
          className="relative group hidden lg:block"
        >
          <button 
            type="submit"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors hover:text-primary-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <input 
            type="text" 
            placeholder="Search courses, lessons..."
            className="w-72 bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="flex items-center gap-4">
          <Link to="/profile" className="flex items-center gap-3 pl-6 border-l border-slate-100 group cursor-pointer hover:no-underline">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 leading-none mb-1">{user?.name}</p>
              <p className="text-[11px] font-bold text-primary-600 uppercase tracking-wider">
                {user?.role === 'admin' ? 'Administrator' : user?.role === 'trainer' ? 'Certified Trainer' : 'Premium Student'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold shadow-lg shadow-primary-500/30 transition-transform group-hover:scale-110">
              {user?.name?.charAt(0)}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
