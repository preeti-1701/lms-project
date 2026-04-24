import React, { useEffect, useState } from 'react';
import Layout from '../../components/shared/Layout';
import { Button, Table, Alert, Spinner, Card } from '../../components/shared/UI';
import api from '../../utils/api';

const adminNav = [
  { path: '/admin', label: 'Dashboard' },
  { path: '/admin/users', label: 'Users' },
  { path: '/admin/courses', label: 'Courses' },
  { path: '/admin/sessions', label: 'Active Sessions' },
  { path: '/admin/audit-logs', label: 'Audit Logs' },
];

export function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');

  const fetchSessions = async () => {
    try {
      const res = await api.get('/sessions');
      setSessions(res.data.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchSessions(); }, []);

  const forceLogout = async (sessionId) => {
    try {
      await api.delete(`/sessions/${sessionId}`);
      setSuccess('Session terminated');
      fetchSessions();
    } catch {}
  };

  const forceLogoutUser = async (userId) => {
    try {
      await api.delete(`/sessions/user/${userId}`);
      setSuccess('All user sessions terminated');
      fetchSessions();
    } catch {}
  };

  const columns = [
    { key: 'name', label: 'User' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'ip_address', label: 'IP Address' },
    { key: 'device_info', label: 'Device', render: (v) => v ? v.slice(0, 50) + (v.length > 50 ? '...' : '') : '—' },
    { key: 'created_at', label: 'Login Time', render: (v) => new Date(v).toLocaleString() },
    { key: 'expires_at', label: 'Expires', render: (v) => new Date(v).toLocaleString() },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="sm" variant="danger" onClick={() => forceLogout(row.id)}>Terminate</Button>
          <Button size="sm" variant="secondary" onClick={() => forceLogoutUser(row.user_id)}>Logout All</Button>
        </div>
      )
    },
  ];

  return (
    <Layout title="Active Sessions" navItems={adminNav}>
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{sessions.length} active session(s)</p>
          <Button variant="secondary" onClick={fetchSessions}>🔄 Refresh</Button>
        </div>
      </Card>
      {loading ? <Spinner /> : <Table columns={columns} data={sessions} emptyMessage="No active sessions" />}
    </Layout>
  );
}

export function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/sessions/audit-logs?limit=200');
        setLogs(res.data.data);
      } catch {}
      setLoading(false);
    };
    fetchLogs();
  }, []);

  const columns = [
    { key: 'name', label: 'User' },
    { key: 'email', label: 'Email' },
    { key: 'action', label: 'Action' },
    { key: 'resource_type', label: 'Resource' },
    { key: 'ip_address', label: 'IP' },
    { key: 'created_at', label: 'Time', render: (v) => new Date(v).toLocaleString() },
  ];

  return (
    <Layout title="Audit Logs" navItems={adminNav}>
      <Card style={{ marginBottom: 16 }}>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{logs.length} log entries (latest 200)</p>
      </Card>
      {loading ? <Spinner /> : <Table columns={columns} data={logs} emptyMessage="No logs found" />}
    </Layout>
  );
}
