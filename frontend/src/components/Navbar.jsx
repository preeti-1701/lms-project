import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from './Button'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-blue-600">
          SimpleLMS
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6">
          <Link to="/courses" className="text-gray-600 hover:text-blue-600 text-sm font-medium">
            Courses
          </Link>

          {user && (
            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 text-sm font-medium">
              Dashboard
            </Link>
          )}

          {user?.role === 'instructor' && (
            <Link to="/instructor" className="text-gray-600 hover:text-blue-600 text-sm font-medium">
              My Courses
            </Link>
          )}
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Hi, <span className="font-medium text-gray-800">{user.username}</span>
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">
                  {user.role}
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-700 font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-blue-600 font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Register
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  )
}