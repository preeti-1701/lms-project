import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/shared/Layout';
import { Button, Table, Modal, FormField, Input, Textarea, Alert, Spinner, Card } from '../../components/shared/UI';
import api from '../../utils/api';

const trainerNav = [
  { path: '/trainer', icon: '📚', label: 'My Courses' },
];

export default function TrainerCourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [videoForm, setVideoForm] = useState({ title: '', youtube_url: '', description: '', order_index: 0 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCourse = async () => {
    try {
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchCourse(); }, [id]);

  const handleAddVideo = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/videos', { ...videoForm, course_id: id });
      setSuccess('Video added successfully');
      setShowModal(false);
      setVideoForm({ title: '', youtube_url: '', description: '', order_index: 0 });
      fetchCourse();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add video');
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Delete this video?')) return;
    try {
      await api.delete(`/videos/${videoId}`);
      fetchCourse();
    } catch {}
  };

  const columns = [
    { key: 'order_index', label: '#' },
    { key: 'title', label: 'Title' },
    { key: 'youtube_video_id', label: 'YouTube ID' },
    { key: 'description', label: 'Description', render: (v) => v ? v.slice(0, 50) + (v.length > 50 ? '...' : '') : '—' },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => <Button size="sm" variant="danger" onClick={() => handleDeleteVideo(row.id)}>Delete</Button>
    },
  ];

  if (loading) return <Layout title="Course Detail" navItems={trainerNav}><Spinner /></Layout>;

  return (
    <Layout title={course?.title || 'Course Detail'} navItems={trainerNav}>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{course?.description || 'No description'}</p>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: 6 }}>📹 {course?.videos?.length || 0} Videos</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button variant="secondary" onClick={() => navigate('/trainer')}>← Back</Button>
            <Button onClick={() => { setShowModal(true); setError(''); }}>+ Add Video</Button>
          </div>
        </div>
      </Card>

      <Table columns={columns} data={course?.videos || []} emptyMessage="No videos added yet" />

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Video">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        <form onSubmit={handleAddVideo}>
          <FormField label="Video Title"><Input required value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })} /></FormField>
          <FormField label="YouTube URL">
            <Input required placeholder="https://youtube.com/watch?v=..." value={videoForm.youtube_url} onChange={(e) => setVideoForm({ ...videoForm, youtube_url: e.target.value })} />
          </FormField>
          <FormField label="Description (Optional)"><Textarea value={videoForm.description} onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })} /></FormField>
          <FormField label="Order Index">
            <Input type="number" value={videoForm.order_index} onChange={(e) => setVideoForm({ ...videoForm, order_index: parseInt(e.target.value) || 0 })} />
          </FormField>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Add Video</Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
