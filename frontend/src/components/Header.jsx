import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, BookOpen } from "lucide-react";
import { useState } from "react";
import { AppContext } from "../context/AppContext";

export default function Header() {
  const navigate = useNavigate();
  const ctx = useContext(AppContext);
  const user = ctx.auth.user;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    ctx.actions.logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (user?.role === "admin") return "/adminDashboard";
    if (user?.role === "trainer") return "/trainerDashboard";
    return "/sudentDashboard";
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <BookOpen className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-secondary hidden sm:inline">LearnHub</span>
          </Link>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-700 hover:text-primary font-medium transition">
              Home
            </Link>
            {user && (
              <Link to={getDashboardLink()} className="text-gray-700 hover:text-primary font-medium transition">
                Dashboard
              </Link>
            )}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{user.email || user.username}</span>
                  <span className="badge badge-primary text-xs">{user.role}</span>
                </div>
                <button onClick={handleLogout} className="btn btn-outline flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            <nav className="flex flex-col gap-3 py-4">
              <Link
                to="/"
                className="px-4 py-2 hover:bg-gray-100 rounded-lg transition"
                onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              {user && (
                <Link
                  to={getDashboardLink()}
                  className="px-4 py-2 hover:bg-gray-100 rounded-lg transition"
                  onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
              )}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-left hover:bg-gray-100 rounded-lg transition flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 hover:bg-gray-100 rounded-lg transition"
                  onClick={() => setIsMenuOpen(false)}>
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
