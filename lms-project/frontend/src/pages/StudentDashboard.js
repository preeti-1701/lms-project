import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const res = await api.get('/courses/my-courses');
        setCourses(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMyCourses();
  }, []);

  return (
    <div className="bg-student" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Navbar />
      <div className="dashboard-layout" style={{ flexGrow: 1 }}>
        <div className="sidebar">
        <h3>My Learning</h3>
        <nav style={{ marginTop: '2rem' }}>
          <div className="nav-item active">My Courses</div>
        </nav>
      </div>
      <div className="main-content">
        <div style={{ background: 'var(--primary)', padding: '2rem', borderRadius: '1rem', color: '#fff', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0 }}>Welcome back, {user.name}!</h1>
          <p style={{ opacity: 0.9, marginTop: '0.5rem' }}>Continue your learning journey where you left off.</p>
        </div>

        <h2>My Courses</h2>
        {courses.length === 0 ? (
          <div className="card" style={{ marginTop: '1rem', textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
            <h3>No Courses Assigned Yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>Please contact your trainer or admin to get access to courses.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
            {courses.map(course => (
              <div key={course.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ color: 'var(--primary)' }}>{course.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem', minHeight: '3em' }}>{course.description}</p>
                </div>
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Videos: {course.video_count}
                  </div>
                  <Link to={`/course/${course.id}`} className="btn" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', textDecoration: 'none' }}>
                    Start Learning
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
