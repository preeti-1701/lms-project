import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/shared/Layout';
import { Spinner, Card } from '../../components/shared/UI';
import api from '../../utils/api';

const studentNav = [
  { path: '/student', icon: '📚', label: 'My Courses' },
];

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        setCourses(res.data.data);
      } catch {}
      setLoading(false);
    };
    fetchCourses();
  }, []);

  return (
    <Layout title="My Courses" navItems={studentNav}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>Welcome back, {user?.name}! 👋</h2>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: 4 }}>You have access to {courses.length} course(s).</p>
      </div>

      {loading ? <Spinner /> : (
        courses.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📭</div>
            <p style={{ color: '#6b7280' }}>No courses assigned yet. Contact your administrator.</p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/student/courses/${course.id}`)}
                style={{
                  background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb',
                  padding: 24, cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.12)'; e.currentTarget.style.borderColor = '#6366f1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
              >
                <div style={{ width: 44, height: 44, background: '#ede9fe', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: 14 }}>
                  📚
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: 8 }}>{course.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: 16 }}>
                  {course.description ? course.description.slice(0, 80) + (course.description.length > 80 ? '...' : '') : 'No description'}
                </p>
                <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: '#9ca3af' }}>
                  <span>📹 {course.video_count ?? 0} Videos</span>
                </div>
                <div style={{ marginTop: 16, padding: '8px 14px', background: '#6366f1', color: '#fff', borderRadius: 8, textAlign: 'center', fontSize: '0.85rem', fontWeight: 500 }}>
                  Start Learning →
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </Layout>
  );
}
