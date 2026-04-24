import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../components/shared/Layout';
import { Button, Table, Modal, FormField, Input, Textarea, Alert, Spinner, Card, Select } from '../../components/shared/UI';
import api from '../../utils/api';

const adminNav = [
  { path: '/admin',label: 'Dashboard' },
  { path: '/admin/users',label: 'Users' },
  { path: '/admin/courses',label: 'Courses' },
  { path: '/admin/sessions',label: 'Active Sessions' },
  { path: '/admin/audit-logs',label: 'Audit Logs' },
];

export default function CourseDetailPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('videos');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [videoForm, setVideoForm] = useState({ title: '', youtube_url: '', description: '', order_index: 0 });
  const [selectedStudent, setSelectedStudent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [courseRes, studentsRes, allUsersRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/enrollments/course/${id}/students`),
        api.get('/users'),
      ]);
      setCourse(courseRes.data.data);
      setStudents(studentsRes.data.data);
      setAllStudents(allUsersRes.data.data.filter(u => u.role === 'student' && u.is_active));
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleAddVideo = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/videos', { ...videoForm, course_id: id });
      setSuccess('Video added successfully');
      setShowVideoModal(false);
      setVideoForm({ title: '', youtube_url: '', description: '', order_index: 0 });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add video');
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Delete this video?')) return;
    try {
      await api.delete(`/videos/${videoId}`);
      fetchData();
    } catch {}
  };

  const handleEnroll = async () => {
    if (!selectedStudent) return;
    try {
      await api.post('/enrollments', { student_id: selectedStudent, course_id: id });
      setSuccess('Student enrolled successfully');
      setShowEnrollModal(false);
      setSelectedStudent('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll student');
    }
  };

  const handleUnenroll = async (studentId) => {
    if (!window.confirm('Remove student from this course?')) return;
    try {
      await api.delete('/enrollments', { data: { student_id: studentId, course_id: id } });
      fetchData();
    } catch {}
  };

  const videoColumns = [
    { key: 'order_index', label: '#' },
    { key: 'title', label: 'Title' },
    { key: 'youtube_video_id', label: 'YouTube ID' },
    { key: 'description', label: 'Description', render: (v) => v ? v.slice(0, 50) + (v.length > 50 ? '...' : '') : '—' },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <Button size="sm" variant="danger" onClick={() => handleDeleteVideo(row.id)}>Delete</Button>
      )
    },
  ];

  const studentColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'enrolled_at', label: 'Enrolled', render: (v) => new Date(v).toLocaleDateString() },
    { key: 'completed_videos', label: 'Completed Videos' },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => <Button size="sm" variant="danger" onClick={() => handleUnenroll(row.id)}>Remove</Button>
    },
  ];

  const tabStyle = (active) => ({
    padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
    background: active ? '#6366f1' : '#f3f4f6', color: active ? '#fff' : '#374151',
    fontWeight: 500, fontSize: '0.875rem', fontFamily: "'Inter', sans-serif",
  });

  if (loading) return <Layout title="Course Detail" navItems={adminNav}><Spinner /></Layout>;

  return (
    <Layout title={course?.title || 'Course Detail'} navItems={adminNav}>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <Card style={{ marginBottom: 20 }}>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{course?.description || 'No description'}</p>
        <div style={{ display: 'flex', gap: 24, marginTop: 12, fontSize: '0.8rem', color: '#9ca3af' }}>
          <span>📹 {course?.videos?.length || 0} Videos</span>
          <span>👥 {students.length} Students</span>
        </div>
      </Card>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button style={tabStyle(tab === 'videos')} onClick={() => setTab('videos')}>📹 Videos</button>
        <button style={tabStyle(tab === 'students')} onClick={() => setTab('students')}>👥 Students</button>
      </div>

      {tab === 'videos' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <Button onClick={() => { setShowVideoModal(true); setError(''); }}>+ Add Video</Button>
          </div>
          <Table columns={videoColumns} data={course?.videos || []} emptyMessage="No videos added yet" />
        </>
      )}

      {tab === 'students' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <Button onClick={() => setShowEnrollModal(true)}>+ Enroll Student</Button>
          </div>
          <Table columns={studentColumns} data={students} emptyMessage="No students enrolled" />
        </>
      )}

      {/* Add Video Modal */}
      <Modal open={showVideoModal} onClose={() => setShowVideoModal(false)} title="Add Video">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        <form onSubmit={handleAddVideo}>
          <FormField label="Video Title"><Input required value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })} /></FormField>
          <FormField label="YouTube URL"><Input required placeholder="https://youtube.com/watch?v=..." value={videoForm.youtube_url} onChange={(e) => setVideoForm({ ...videoForm, youtube_url: e.target.value })} /></FormField>
          <FormField label="Description (Optional)"><Textarea value={videoForm.description} onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })} /></FormField>
          <FormField label="Order">
            <Input type="number" value={videoForm.order_index} onChange={(e) => setVideoForm({ ...videoForm, order_index: parseInt(e.target.value) || 0 })} />
          </FormField>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="secondary" type="button" onClick={() => setShowVideoModal(false)}>Cancel</Button>
            <Button type="submit">Add Video</Button>
          </div>
        </form>
      </Modal>

      {/* Enroll Student Modal */}
      <Modal open={showEnrollModal} onClose={() => setShowEnrollModal(false)} title="Enroll Student">
        <FormField label="Select Student">
          <Select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
            <option value="">-- Select a student --</option>
            {allStudents
              .filter(s => !students.find(en => en.id === s.id))
              .map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)
            }
          </Select>
        </FormField>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <Button variant="secondary" onClick={() => setShowEnrollModal(false)}>Cancel</Button>
          <Button onClick={handleEnroll} disabled={!selectedStudent}>Enroll</Button>
        </div>
      </Modal>
    </Layout>
  );
}
