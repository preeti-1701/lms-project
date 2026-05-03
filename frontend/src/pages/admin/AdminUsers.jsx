import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Users, UserCheck, GraduationCap, Shield, X, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

const roleColor = { admin: '#059669', trainer: '#0891b2', student: '#4f46e5' };
const roleLight = { admin: '#d1fae5',  trainer: '#e0f2fe',  student: '#e0e7ff'  };
const roleBadge = { admin: 'badge-success', trainer: 'badge-info', student: 'badge-primary' };

// User Modal
const UserModal = ({ user, onClose, onSaved }) => {
  const isEdit = !!user;
  const [form, setForm] = useState(user
    ? { name: user.name, email: user.email, role: user.role, password: '' }
    : { name: '', email: '', role: 'student', password: '' }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.name || !form.email) { setError('Name and email required'); return; }
    if (!isEdit && !form.password) { setError('Password required for new user'); return; }
    setLoading(true); setError('');
    try {
      if (isEdit) await api.put(`/users/${user.id}`, form);
      else        await api.post('/users', form);
      toast.success(isEdit ? 'User updated' : 'User created');
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving user');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit User' : 'Create User'}</h2>
          <button className="modal-close" onClick={onClose}><X /></button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={form.name} onChange={set('name')} placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="user@example.com" disabled={isEdit} />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-input" value={form.role} onChange={set('role')}>
              <option value="student">Student</option>
              <option value="trainer">Trainer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{isEdit ? 'New Password (leave blank to keep)' : 'Password *'}</label>
            <input className="form-input" type="password" value={form.password} onChange={set('password')} placeholder="Min 8 characters" />
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="spinner" /> : isEdit ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('all');
  const [modal,   setModal]   = useState(null); // null | { user? }

  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/users'); setUsers(data.users); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async u => {
    try {
      await api.put(`/users/${u.id}`, { is_active: !u.is_active });
      toast.success(u.is_active ? 'User disabled' : 'User enabled');
      load();
    } catch { toast.error('Failed to update user'); }
  };

  const deleteUser = async u => {
    if (!window.confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    try { await api.delete(`/users/${u.id}`); toast.success('User deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const filtered = users.filter(u => {
    const matchRole = filter === 'all' || u.role === filter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="anim-fade">
      <div className="page-header">
        <div>
          <h2 className="page-title">User Management</h2>
          <p className="page-sub">{users.length} total users</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ user: null })}>
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <div className="search-bar">
          <Search size={16} />
          <input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['all','student','trainer','admin'].map(r => (
          <button key={r} className={`btn btn-sm ${filter === r ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(r)}>
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <div className="page-loader"><div className="spinner" style={{ width:44, height:44 }} /></div> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign:'center', color:'var(--text-3)', padding:40 }}>No users found</td></tr>
              )}
              {filtered.map(u => (
                <tr key={u.id}>
                  <td style={{ color:'var(--text-3)', fontSize:13 }}>{u.static_user_id || '—'}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:34, height:34, borderRadius:'50%', background:roleLight[u.role], color:roleColor[u.role], display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, flexShrink:0 }}>
                        {u.name[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight:600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color:'var(--text-2)', fontSize:14 }}>{u.email}</td>
                  <td><span className={`badge ${roleBadge[u.role]}`}>{u.role}</span></td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {u.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setModal({ user: u })} title="Edit">
                        <Edit2 size={13} />
                      </button>
                      <button className={`btn btn-sm ${u.is_active ? 'btn-warning' : 'btn-success'}`}
                        style={{ background: u.is_active ? '#fef3c7' : '#d1fae5', border:`1px solid ${u.is_active ? '#fde68a' : '#6ee7b7'}`, color: u.is_active ? '#92400e' : '#065f46' }}
                        onClick={() => toggleActive(u)} title={u.is_active ? 'Disable' : 'Enable'}>
                        {u.is_active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                      </button>
                      {u.role !== 'admin' && (
                        <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u)} title="Delete">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && (
        <UserModal user={modal.user} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />
      )}
    </div>
  );
};

export default AdminUsers;
