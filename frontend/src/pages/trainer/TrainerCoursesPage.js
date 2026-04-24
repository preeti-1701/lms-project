import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/shared/Layout';
import { Button, Badge, Table, Modal, FormField, Input, Textarea, Alert, Spinner, Card } from '../../components/shared/UI';
import api from '../../utils/api';

const trainerNav = [
  { path: '/trainer', icon: '📚', label: 'My Courses' },
];

export default function TrainerCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/courses', form);
      setSuccess('Course created successfully');
      setShowModal(false);
      setForm({ title: '', description: '' });
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
    }
  };

  const columns = [
    { key: 'title', label: 'Course Title' },
    { key: 'description', label: 'Description', render: (v) => v ? v.slice(0, 60) + (v.length > 60 ? '...' : '') : '—' },
    { key: 'video_count', label: 'Videos', render: (v) => v ?? 0 },
    { key: 'student_count', label: 'Students', render: (v) => v ?? 0 },
    { key: 'is_active', label: 'Status', render: (v) => <Badge color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Badge> },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <Button size="sm" variant="secondary" onClick={() => navigate(`/trainer/courses/${row.id}`)}>Manage Videos</Button>
      )
    },
  ];

  return (
    <Layout title="My Courses" navItems={trainerNav}>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{courses.length} course(s)</p>
          <Button onClick={() => { setShowModal(true); setError(''); }}>+ Create Course</Button>
        </div>
      </Card>

      {loading ? <Spinner /> : <Table columns={columns} data={courses} emptyMessage="No courses yet" />}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create New Course">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        <form onSubmit={handleCreate}>
          <FormField label="Course Title"><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Description"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></FormField>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Create Course</Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
