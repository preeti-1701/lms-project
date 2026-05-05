import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">LMS</Link>
      </div>
      <div className="navbar-links">
        {user?.role === 'admin' && (
          <>
            <Link to="/admin">Dashboard</Link>
            <Link to="/admin/users">Manage Users</Link>
          </>
        )}
        {user?.role === 'trainer' && (
          <Link to="/trainer">Dashboard</Link>
        )}
        {user?.role === 'student' && (
          <Link to="/student">Dashboard</Link>
        )}
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
}
