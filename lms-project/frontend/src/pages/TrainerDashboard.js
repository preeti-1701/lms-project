import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Navbar from '../components/Navbar';
import CourseAssignmentModal from '../components/CourseAssignmentModal';

const TrainerDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '' });
  const [activeTab, setActiveTab] = useState('courses');
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    if (activeTab === 'courses') fetchCourses();
    else if (activeTab === 'students') fetchStudents();
    else if (activeTab === 'sessions') fetchSessions();
  }, [activeTab]);

  const fetchCourses = async () => {
    const res = await api.get('/courses');
    setCourses(res.data);
  };

  const fetchStudents = async () => {
    const res = await api.get('/users');
    setStudents(res.data.filter(u => u.role === 'student'));
  };

  const fetchSessions = async () => {
    const res = await api.get('/sessions');
    // Trainers only see student sessions
    setSessions(res.data.filter(s => s.role === 'student'));
  };

  const handleForceLogout = async (userId) => {
    await api.post(`/sessions/force-logout/${userId}`);
    fetchSessions();
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    await api.post('/courses', newCourse);
    setNewCourse({ title: '', description: '' });
    setShowModal(false);
    fetchCourses();
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', { ...newStudent, role: 'student' });
      setNewStudent({ name: '', email: '', password: '' });
      setShowStudentModal(false);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create student');
    }
  };

  const handleRemoveStudent = async (userId) => {
    if (window.confirm('Are you sure you want to remove this student?')) {
      await api.delete(`/users/${userId}`);
      fetchStudents();
    }
  };

  return (
    <div className="bg-trainer" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Navbar />
      <div className="dashboard-layout" style={{ flexGrow: 1 }}>
        <div className="sidebar">
          <h3>Trainer Panel</h3>
          <nav style={{ marginTop: '2rem' }}>
            <button onClick={() => setActiveTab('courses')} className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer' }}>My Courses</button>
            <button onClick={() => setActiveTab('students')} className={`nav-item ${activeTab === 'students' ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer' }}>Student Management</button>
            <button onClick={() => setActiveTab('sessions')} className={`nav-item ${activeTab === 'sessions' ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer' }}>Active Sessions</button>
          </nav>
        </div>
      <div className="main-content">
        {activeTab === 'courses' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Course Management</h2>
              <button className="btn" style={{ width: 'auto' }} onClick={() => setShowModal(true)}>Create New Course</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
              {courses.map(course => (
                <div key={course.id} className="card">
                  <h3>{course.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{course.description}</p>
                  <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>Videos: {course.video_count}</div>
                  <button className="btn" style={{ marginTop: '1rem' }} onClick={() => window.location.href = `/course/${course.id}`}>Manage Videos</button>
                </div>
              ))}
            </div>
          </>
        ) : activeTab === 'students' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Student Management</h2>
              <button className="btn" style={{ width: 'auto' }} onClick={() => setShowStudentModal(true)}>Add New Student</button>
            </div>
            <div className="card" style={{ marginTop: '1rem' }}>
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.email}</td>
                      <td>
                        <button onClick={() => setSelectedUser(s)} className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem', width: 'auto', marginRight: '0.5rem' }}>Assign Courses</button>
                        <button onClick={() => handleForceLogout(s.id)} className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem', width: 'auto', marginRight: '0.5rem', background: 'var(--secondary)' }}>Logout User</button>
                        <button onClick={() => handleRemoveStudent(s.id)} className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem', width: 'auto', background: 'var(--danger)' }}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <h2>Active Student Sessions</h2>
            <div className="card" style={{ marginTop: '1rem' }}>
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>IP Address</th>
                    <th>Device</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(s => (
                    <tr key={s.id}>
                      <td>{s.name} ({s.email})</td>
                      <td>{s.ip_address}</td>
                      <td>{s.device_info}</td>
                      <td>{s.is_active ? <span style={{ color: 'green', fontWeight: 'bold' }}>Online</span> : 'Offline'}</td>
                      <td>
                        {s.is_active && (
                          <button onClick={() => handleForceLogout(s.user_id)} className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem', width: 'auto', background: 'var(--danger)' }}>Force Logout</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
             <div className="card" style={{ width: '400px', margin: 'auto' }}>
                <h3>Add Course</h3>
                <form onSubmit={handleCreateCourse} style={{ marginTop: '1rem' }}>
                  <div className="form-group">
                    <label>Title</label>
                    <input type="text" value={newCourse.title} onChange={(e) => setNewCourse({...newCourse, title: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem' }} value={newCourse.description} onChange={(e) => setNewCourse({...newCourse, description: e.target.value})} rows="3"></textarea>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="btn">Create</button>
                    <button type="button" className="btn" style={{ background: 'var(--secondary)' }} onClick={() => setShowModal(false)}>Cancel</button>
                  </div>
                </form>
             </div>
          </div>
        )}

        {showStudentModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
             <div className="card" style={{ width: '400px', margin: 'auto' }}>
                <h3>Add New Student</h3>
                <form onSubmit={handleCreateStudent} style={{ marginTop: '1rem' }}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={newStudent.email} onChange={(e) => setNewStudent({...newStudent, email: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" value={newStudent.password} onChange={(e) => setNewStudent({...newStudent, password: e.target.value})} required />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="btn">Create Student</button>
                    <button type="button" className="btn" style={{ background: 'var(--secondary)' }} onClick={() => setShowStudentModal(false)}>Cancel</button>
                  </div>
                </form>
             </div>
          </div>
        )}
      </div>
      </div>
      {selectedUser && (
        <CourseAssignmentModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      )}
    </div>
  );
};

export default TrainerDashboard;
