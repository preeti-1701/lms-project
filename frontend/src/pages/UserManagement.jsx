import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: 'admin123', role: 'student' });

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/users/manage/');
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/courses/');
      setCourses(response.data);
    } catch (error) {
      toast.error('Failed to fetch courses');
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/users/manage/', formData);
      toast.success('User created successfully!');
      setShowForm(false);
      setFormData({ name: '', email: '', password: 'admin123', role: 'student' });
      fetchUsers();
    } catch (error) {
      toast.error('Failed to create user');
    }
  };

  const assignCourse = async (userId, courseId) => {
    if (!courseId) return;
    try {
      await axios.post('http://localhost:8000/api/courses/assign/', {
        user_id: userId,
        course_id: courseId
      });
      toast.success('Course assigned successfully!');
    } catch (error) {
      toast.error('Failed to assign course');
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:8000/api/users/manage/${userId}/`);
        toast.success('User deleted');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">👥 User Management</h1>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Create User
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create New User</h2>
            <form onSubmit={createUser}>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  required 
                />
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  required 
                />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
                <select 
                  value={formData.role} 
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="student">Student</option>
                  <option value="trainer">Trainer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
                Create User
              </button>
            </form>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl shadow-md overflow-hidden">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Role</th>
                <th className="px-6 py-3 text-left">Assign Course</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'trainer' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'student' && (
                      <select 
                        onChange={(e) => assignCourse(user.id, e.target.value)} 
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Course</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => deleteUser(user.id)} 
                      className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;