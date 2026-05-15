import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    const isStaff = user?.role === 'admin' || user?.role === 'trainer';
    logout(isStaff ? '/admin-login' : '/login');
  };

  const getNavItems = () => {
    const common = [
      { name: 'Profile', path: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    ];

    if (user?.role === 'admin') {
      return [
        { name: 'Control Hub', path: '/', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
        { name: 'Personnel', path: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { name: 'Curriculum', path: '/admin/courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253' },
        ...common
      ];
    }

    if (user?.role === 'trainer') {
      return [
        { name: 'My Curriculum', path: '/admin/courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253' },
        ...common
      ];
    }

    // Default: Student
    return [
      { name: 'Dashboard', path: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      { name: 'Browse Courses', path: '/browse', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
      { name: 'My Courses', path: '/my-courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
      ...common
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-72 bg-white border-r border-slate-100 h-screen sticky top-0 flex flex-col z-50">
      <div className="p-10 pb-8 flex items-center gap-4">
        <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-600/30">
          G
        </div>
        <span className="text-2xl font-display font-bold text-slate-900 tracking-tight">Gravity</span>
      </div>

      <nav className="flex-grow px-6 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link-modern ${
                isActive
                  ? 'bg-primary-50 text-primary-700 shadow-sm shadow-primary-500/5'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${item.name === 'Dashboard' ? 'group-hover:rotate-12' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
            </svg>
            <span className="font-semibold">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-50">
        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
          <Link to="/profile" className="flex items-center gap-3 mb-4 group cursor-pointer hover:no-underline">
            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary-600 font-bold text-lg border border-slate-100 transition-transform group-hover:scale-110">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate group-hover:text-primary-600 transition-colors">{user?.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{user?.role}</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-95 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            LOGOUT
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
