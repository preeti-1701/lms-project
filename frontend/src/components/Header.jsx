import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-jet/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-jet">
          SimpleLMS
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/courses" className="text-jet/70 hover:text-jet text-sm font-medium transition-colors">
            Courses
          </Link>
          {user && (
            <Link to="/dashboard" className="text-jet/70 hover:text-jet text-sm font-medium transition-colors">
              Dashboard
            </Link>
          )}
          {user?.role === 'instructor' && (
            <Link to="/instructor" className="text-jet/70 hover:text-jet text-sm font-medium transition-colors">
              Teaching
            </Link>
          )}
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:text-right">
                <p className="text-sm font-semibold text-jet">{user.username}</p>
                <p className="text-xs text-jet/60 capitalize">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-jet/70 hover:text-crimson font-medium transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm text-jet/70 hover:text-jet font-medium transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm bg-tan hover:bg-[#d4a876] text-jet font-semibold px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}