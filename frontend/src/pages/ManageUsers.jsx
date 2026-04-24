import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    mobile: '',
    role: 'student',
    password: ''
  })
  const [filter, setFilter] = useState('')

  useEffect(() => {
    loadUsers()
  }, [filter])

  const loadUsers = async () => {
    try {
      const url = filter ? `/users/?role=${filter}` : '/users/'
      const res = await api.get(url)
      setUsers(res.data)
    } catch (err) {
      console.error('Failed to load users:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingUser) {
        const data = { ...formData }
        if (!data.password) delete data.password
        await api.patch(`/users/${editingUser.id}/`, data)
      } else {
        await api.post('/users/', formData)
      }
      setShowModal(false)
      resetForm()
      loadUsers()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save user')
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      mobile: '',
      role: 'student',
      password: ''
    })
    setEditingUser(null)
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      mobile: user.mobile || '',
      role: user.role,
      password: ''
    })
    setShowModal(true)
  }

  const handleToggleActive = async (user) => {
    try {
      await api.post(`/users/${user.id}/toggle_active/`)
      loadUsers()
    } catch (err) {
      alert('Failed to toggle user status')
    }
  }

  const handleForceLogout = async (user) => {
    try {
      await api.post(`/users/${user.id}/force_logout/`)
      alert(`${user.email} has been logged out`)
    } catch (err) {
      alert('Failed to force logout')
    }
  }

  const handleDelete = async (user) => {
    if (!confirm(`Are you sure you want to delete ${user.email}?`)) return
    try {
      await api.delete(`/users/${user.id}/`)
      loadUsers()
    } catch (err) {
      alert('Failed to delete user')
    }
  }

  return (
    <div className="dashboard">
      <h1>Manage Users</h1>
      <p className="dashboard-subtitle">Create and manage user accounts</p>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <h2>Users</h2>
            <select 
              value={filter} 
              onChange={e => setFilter(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="trainer">Trainer</option>
              <option value="student">Student</option>
            </select>
          </div>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={() => { resetForm(); setShowModal(true); }}
          >
            + Add User
          </button>
        </div>
        <div className="card-body">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last IP</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.first_name} {user.last_name}</td>
                    <td>
                      <span className={`badge badge-${user.role}`}>{user.role}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${user.is_active ? 'active' : 'inactive'}`}>
                        {user.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#666' }}>{user.last_ip || '-'}</td>
                    <td className="actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(user)}>
                        Edit
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleToggleActive(user)}>
                        {user.is_active ? 'Disable' : 'Enable'}
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleForceLogout(user)}>
                        Logout
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user)}>
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

      {/* User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? 'Edit User' : 'Create User'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>First Name</label>
                  <input 
                    type="text"
                    value={formData.first_name}
                    onChange={e => setFormData({...formData, first_name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input 
                    type="text"
                    value={formData.last_name}
                    onChange={e => setFormData({...formData, last_name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Mobile</label>
                  <input 
                    type="text"
                    value={formData.mobile}
                    onChange={e => setFormData({...formData, mobile: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select 
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="student">Student</option>
                    <option value="trainer">Trainer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{editingUser ? 'New Password (leave blank to keep current)' : 'Password'}</label>
                  <input 
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingUser ? 'Save' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
