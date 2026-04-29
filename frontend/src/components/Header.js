import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="bg-slate-900/60 backdrop-blur-xl border-b border-white/10 px-6 md:px-12 py-4 relative z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <h2 className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
              SecureLearn
            </span>
          </h2>
          <span className="text-xs uppercase font-semibold text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
            LMS
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-8">
          <Link
            to="/"
            className="text-slate-300 hover:text-cyan-400 transition-colors duration-300 font-medium"
          >
            Home
          </Link>
          <Link
            to="/login"
            className="text-slate-300 hover:text-cyan-400 transition-colors duration-300 font-medium"
          >
            Login
          </Link>
          <Link
            to="/about"
            className="text-slate-300 hover:text-cyan-400 transition-colors duration-300 font-medium"
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;