import React, { useEffect, useState } from 'react';
import Layout from '../../components/shared/Layout';
import { Button, Badge, Table, Modal, FormField, Input, Select, Alert, Spinner, Card } from '../../components/shared/UI';
import api from '../../utils/api';

const adminNav = [
  { path: '/admin', label: 'Dashboard' },
  { path: '/admin/users', label: 'Users' },
  { path: '/admin/courses', label: 'Courses' },
  { path: '/admin/sessions',label: 'Active Sessions' },
  { path: '/admin/audit-logs',label: 'Audit Logs' },
];

const emptyForm = { name: '', email: '', mobile: '', password: '', role: 'student' };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [resetUserId, setResetUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/users', form);
      setSuccess('User created successfully');
      setShowModal(false);
      setForm(emptyForm);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  const toggleStatus = async (user) => {
    try {
      await api.patch(`/users/${user.id}/toggle-status`);
      fetchUsers();
    } catch {}
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    try {
      await api.post(`/users/${resetUserId}/reset-password`, { newPassword });
      setSuccess('Password reset successfully');
      setShowResetModal(false);
      setNewPassword('');
      setResetUserId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'role', label: 'Role', render: (v) => <Badge color={v === 'admin' ? 'purple' : v === 'trainer' ? 'blue' : 'green'}>{v}</Badge> },
    { key: 'is_active', label: 'Status', render: (v) => <Badge color={v ? 'green' : 'red'}>{v ? 'Active' : 'Disabled'}</Badge> },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="sm" variant={row.is_active ? 'danger' : 'success'} onClick={() => toggleStatus(row)}>
            {row.is_active ? 'Disable' : 'Enable'}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => { setResetUserId(row.id); setShowResetModal(true); }}>
            Reset PW
          </Button>
        </div>
      )
    },
  ];

  return (
    <Layout title="User Management" navItems={adminNav}>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 12, flex: 1, flexWrap: 'wrap' }}>
            <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
            <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ maxWidth: 160 }}>
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="trainer">Trainer</option>
              <option value="student">Student</option>
            </Select>
          </div>
          <Button onClick={() => { setShowModal(true); setForm(emptyForm); setError(''); }}>+ Add User</Button>
        </div>
      </Card>

      {loading ? <Spinner /> : <Table columns={columns} data={filtered} emptyMessage="No users found" />}

      {/* Create User Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create New User">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        <form onSubmit={handleCreate}>
          <FormField label="Full Name"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></FormField>
          <FormField label="Email"><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></FormField>
          <FormField label="Mobile (Optional)"><Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></FormField>
          <FormField label="Password"><Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 8 characters" /></FormField>
          <FormField label="Role">
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="student">Student</option>
              <option value="trainer">Trainer</option>
              <option value="admin">Admin</option>
            </Select>
          </FormField>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Create User</Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal open={showResetModal} onClose={() => { setShowResetModal(false); setNewPassword(''); setError(''); }} title="Reset Password">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        <FormField label="New Password">
          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 characters" />
        </FormField>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <Button variant="secondary" onClick={() => setShowResetModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleResetPassword}>Reset Password</Button>
        </div>
      </Modal>
    </Layout>
  );
}
