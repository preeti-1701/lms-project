import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">LMS Platform</Link>
        <div className="navbar-links">
          <Link to="/">Dashboard</Link>
          {(user?.role === 'admin' || user?.role === 'trainer') && (
            <Link to="/courses">Manage Courses</Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/users">Manage Users</Link>
          )}
          <span>{user?.name} ({user?.role})</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;