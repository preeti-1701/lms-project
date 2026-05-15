import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    const isStaff = user?.role === 'admin' || user?.role === 'trainer';
    logout(isStaff ? '/admin-login' : '/login');
  };

  if (!user) return null; // Don't show navbar if not logged in

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-600">
              SecureLMS
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              <Link to="/" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin/users" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  Users
                </Link>
              )}
              {(user.role === 'admin' || user.role === 'trainer') && (
                <Link to="/admin/courses" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  Manage Courses
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-500">Logged in as: </span>
              <span className="font-semibold text-gray-700">{user.name}</span>
              <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-bold uppercase">
                {user.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
