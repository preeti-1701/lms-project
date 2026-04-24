import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/shared/Layout';
import { Spinner, Card, Badge } from '../../components/shared/UI';
import api from '../../utils/api';

const studentNav = [
  { path: '/student', icon: '📚', label: 'My Courses' },
];

export default function StudentCoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, progressRes] = await Promise.all([
          api.get(`/courses/${id}`),
          api.get(`/progress/course/${id}`),
        ]);
        setCourse(courseRes.data.data);
        const prog = {};
        progressRes.data.data.videos.forEach(v => { prog[v.video_id] = v; });
        setProgress(prog);
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return <Layout title="Course" navItems={studentNav}><Spinner /></Layout>;

  const videos = course?.videos || [];
  const completed = Object.values(progress).filter(p => p.completed).length;
  const pct = videos.length > 0 ? Math.round((completed / videos.length) * 100) : 0;

  return (
    <Layout title={course?.title || 'Course'} navItems={studentNav}>
      {/* Progress bar */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{course?.description}</p>
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: 4 }}>
              {completed} of {videos.length} videos completed
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#6366f1' }}>{pct}%</span>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Complete</p>
          </div>
        </div>
        <div style={{ height: 8, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: 99, transition: 'width 0.4s' }} />
        </div>
      </Card>

      {/* Video list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {videos.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No videos in this course yet.</Card>
        ) : videos.map((video, idx) => {
          const vp = progress[video.id];
          const isCompleted = vp?.completed;

          return (
            <div
              key={video.id}
              onClick={() => navigate(`/student/courses/${id}/videos/${video.id}`)}
              style={{
                background: '#fff', borderRadius: 12, border: `1px solid ${isCompleted ? '#d1fae5' : '#e5e7eb'}`,
                padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16,
                transition: 'all 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6366f1'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = isCompleted ? '#d1fae5' : '#e5e7eb'}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: isCompleted ? '#d1fae5' : '#ede9fe',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', flexShrink: 0,
              }}>
                {isCompleted ? '✅' : '▶️'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem', marginBottom: 2 }}>
                  {idx + 1}. {video.title}
                </p>
                {video.description && (
                  <p style={{ color: '#9ca3af', fontSize: '0.78rem' }}>{video.description.slice(0, 80)}</p>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {isCompleted && <Badge color="green">Done</Badge>}
                {vp && !isCompleted && vp.watched_seconds > 0 && <Badge color="yellow">In Progress</Badge>}
                <span style={{ color: '#6366f1', fontSize: '0.85rem' }}>→</span>
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
