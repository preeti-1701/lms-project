import React, { useState, useEffect } from 'react';
import api from '../api/api';

const CourseAssignmentModal = ({ user, onClose }) => {
  const [allCourses, setAllCourses] = useState([]);
  const [assignedCourseIds, setAssignedCourseIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, userCoursesRes] = await Promise.all([
        api.get('/courses'),
        api.get(`/users/${user.id}/courses`)
      ]);
      setAllCourses(coursesRes.data);
      setAssignedCourseIds(userCoursesRes.data.map(c => c.id));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleToggleCourse = async (courseId, isAssigned) => {
    try {
      if (isAssigned) {
        await api.post('/users/remove-course', { userId: user.id, courseId });
        setAssignedCourseIds(assignedCourseIds.filter(id => id !== courseId));
      } else {
        await api.post('/users/assign-course', { userId: user.id, courseId });
        setAssignedCourseIds([...assignedCourseIds, courseId]);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>Manage Courses for {user.name}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>
        
        {loading ? <p>Loading...</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {allCourses.map(course => {
              const isAssigned = assignedCourseIds.includes(course.id);
              return (
                <div key={course.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: '600' }}>{course.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{course.creator_name}</div>
                  </div>
                  <button 
                    onClick={() => handleToggleCourse(course.id, isAssigned)}
                    className="btn"
                    style={{ 
                      width: 'auto', 
                      padding: '0.4rem 1rem', 
                      fontSize: '0.875rem',
                      background: isAssigned ? 'var(--danger)' : 'var(--primary)'
                    }}
                  >
                    {isAssigned ? 'Remove' : 'Assign'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseAssignmentModal;
