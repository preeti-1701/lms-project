import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'student'
  });
  const [filter, setFilter] = useState('all');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users/');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/', userForm);
      setUserForm({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'student'
      });
      setShowUserForm(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Error creating user. Make sure email is unique and password is provided.');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/users/${userId}/`, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${userId}/`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  // Filter users by role
  const filteredUsers = filter === 'all' 
    ? users 
    : users.filter(u => u.role === filter);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="manage-users">
      <div className="page-header">
        <h1>Manage Users</h1>
        <button className="btn-primary" onClick={() => setShowUserForm(!showUserForm)}>
          {showUserForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {showUserForm && (
        <form className="user-form" onSubmit={handleUserSubmit}>
          <h3>Add New User</h3>
          <div className="form-row">
            <input
              type="email"
              placeholder="Email *"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password *"
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <input
              type="text"
              placeholder="First Name"
              value={userForm.first_name}
              onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Last Name"
              value={userForm.last_name}
              onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })}
            />
          </div>
          <select
            value={userForm.role}
            onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
          >
            <option value="student">Student</option>
            <option value="trainer">Trainer</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" className="btn-primary">Create User</button>
        </form>
      )}

      <div className="filter-tabs">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All ({users.length})
        </button>
        <button 
          className={filter === 'admin' ? 'active' : ''} 
          onClick={() => setFilter('admin')}
        >
          Admins ({users.filter(u => u.role === 'admin').length})
        </button>
        <button 
          className={filter === 'trainer' ? 'active' : ''} 
          onClick={() => setFilter('trainer')}
        >
          Trainers ({users.filter(u => u.role === 'trainer').length})
        </button>
        <button 
          className={filter === 'student' ? 'active' : ''} 
          onClick={() => setFilter('student')}
        >
          Students ({users.filter(u => u.role === 'student').length})
        </button>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.first_name} {user.last_name}</td>
                <td>{user.email}</td>
                <td>
                  <select 
                    value={user.role} 
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className={`role-select role-${user.role}`}
                  >
                    <option value="student">Student</option>
                    <option value="trainer">Trainer</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="btn-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <p>No users found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
