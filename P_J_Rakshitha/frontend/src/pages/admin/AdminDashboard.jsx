import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import UserManagement from './UserManagement'
import CourseManagement from './CourseManagement'

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('users')

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">LMS Admin Panel</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">Welcome, {user?.full_name}</span>
          <button
            onClick={logout}
            className="bg-white text-blue-600 px-4 py-1 rounded-lg text-sm font-semibold hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Tabs */}
      <div className="bg-white border-b px-6 flex gap-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`py-4 text-sm font-medium border-b-2 transition ${
            activeTab === 'users'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          User Management
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`py-4 text-sm font-medium border-b-2 transition ${
            activeTab === 'courses'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Course Management
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'courses' && <CourseManagement />}
      </div>

    </div>
  )
}

export default AdminDashboard