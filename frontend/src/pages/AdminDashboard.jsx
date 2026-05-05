import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function AdminDashboard() {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({ title: '', description: '', trainer: '' });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');
  const [activeSessions, setActiveSessions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchData = async () => {
    try {
      const coursesRes = await api.get('/courses/');
      setCourses(coursesRes.data);
      
      const usersRes = await api.get('/users/?role=trainer');
      setUsers(usersRes.data);
      
      const statsRes = await api.get('/dashboard/stats/');
      setStats(statsRes.data);
      
      const sessionsRes = await api.get('/admin/active-sessions/');
      setActiveSessions(sessionsRes.data.sessions || []);
      
      const notifRes = await api.get('/security/notifications/');
      setNotifications(notifRes.data);
      
      // Count unread
      const unread = notifRes.data.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Poll for notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      api.get('/security/notifications/')
        .then(res => {
          const unread = res.data.filter(n => !n.is_read).length;
          setUnreadCount(unread);
          setNotifications(res.data);
          
          // Play sound or show alert for new notifications
          if (unread > unreadCount) {
            console.log('New security notification received');
          }
        })
        .catch(err => console.error(err));
    }, 30000); // 30 seconds polling

    return () => clearInterval(interval);
  }, [unreadCount]);

  const handleForceLogout = async (userId) => {
    if (!confirm('Force logout this user?')) return;
    try {
      await api.post('/admin/force-logout/', { user_id: userId });
      alert('User has been logged out');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        title: courseForm.title,
        description: courseForm.description,
        trainer: courseForm.trainer || null
      };
      
      if (editingCourse) {
        await api.put(`/courses/${editingCourse.id}/`, data);
      } else {
        await api.post('/courses/', data);
      }
      setCourseForm({ title: '', description: '', trainer: '' });
      setShowCourseForm(false);
      setEditingCourse(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Delete this course?')) return;
    try {
      await api.delete(`/courses/${courseId}/`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({ 
      title: course.title, 
      description: course.description,
      trainer: course.trainer || ''
    });
    setShowCourseForm(true);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.total_users || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Students</h3>
            <p className="stat-number">{stats.total_students || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Trainers</h3>
            <p className="stat-number">{stats.total_trainers || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Courses</h3>
            <p className="stat-number">{stats.total_courses || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Videos</h3>
            <p className="stat-number">{stats.total_videos || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Enrollments</h3>
            <p className="stat-number">{stats.total_enrollments || 0}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={activeTab === 'courses' ? 'active' : ''} 
          onClick={() => setActiveTab('courses')}
        >
          Courses
        </button>
        <button 
          className={activeTab === 'sessions' ? 'active' : ''} 
          onClick={() => setActiveTab('sessions')}
        >
          Active Sessions ({activeSessions.length})
        </button>
        <button 
          className={activeTab === 'security' ? 'active' : ''} 
          onClick={() => setActiveTab('security')}
        >
          Security Alerts ({unreadCount})
        </button>
      </div>

      {activeTab === 'courses' && (
        <>
          <div className="section-header">
            <h2>All Courses</h2>
            <button className="btn-primary" onClick={() => setShowCourseForm(!showCourseForm)}>
              {showCourseForm ? 'Cancel' : '+ Add Course'}
            </button>
          </div>

          {showCourseForm && (
            <form className="course-form" onSubmit={handleCourseSubmit}>
              <h3>{editingCourse ? 'Edit Course' : 'Add New Course'}</h3>
              <input
                type="text"
                placeholder="Course Title"
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Course Description"
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                required
              />
              <select
                value={courseForm.trainer}
                onChange={(e) => setCourseForm({ ...courseForm, trainer: e.target.value })}
              >
                <option value="">Select Trainer (Optional)</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </option>
                ))}
              </select>
              <button type="submit" className="btn-primary">
                {editingCourse ? 'Update' : 'Create'} Course
              </button>
            </form>
          )}

          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course.id} className="course-card-admin">
                <div className="course-info">
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  {course.trainer_name && (
                    <span className="course-meta trainer">
                      Trainer: {course.trainer_name}
                    </span>
                  )}
                  {!course.trainer_name && (
                    <span className="course-meta no-trainer">No Trainer Assigned</span>
                  )}
                  <span className="course-meta">{course.videos?.length || 0} videos</span>
                </div>
                <div className="course-actions">
                  <Link to={`/course/${course.id}`} className="btn-secondary">
                    Manage
                  </Link>
                  <button onClick={() => handleEditCourse(course)} className="btn-secondary">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteCourse(course.id)} className="btn-danger">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {courses.length === 0 && (
            <div className="empty-state">
              <p>No courses yet. Create your first course!</p>
            </div>
          )}
        </>
      )}

      {activeTab === 'sessions' && (
        <div className="sessions-section">
          <h2>Active User Sessions</h2>
          <p className="info-message">
            🔒 Only one device per user can be logged in at a time. New login automatically ends previous sessions.
          </p>
          <table className="sessions-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Last IP</th>
                <th>Device</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeSessions.map((session) => (
                <tr key={session.id}>
                  <td>{session.email}</td>
                  <td>{session.role}</td>
                  <td>{session.last_ip || 'N/A'}</td>
                  <td className="device-cell">{session.last_device || 'N/A'}</td>
                  <td>
                    <span className="status-active">Active</span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleForceLogout(session.id)}
                      className="btn-danger btn-small"
                    >
                      Force Logout
                    </button>
                  </td>
                </tr>
              ))}
              {activeSessions.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-cell">No active sessions</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="security-section">
          <div className="section-header">
            <h2>Security Alerts</h2>
            <button className="btn-secondary" onClick={() => fetchData()}>
              🔄 Refresh
            </button>
          </div>
          <p className="info-message">
            These alerts are detected when students attempt to record, screenshot, watermark, or download videos.
            Polls every 30 seconds for new alerts.
          </p>
          
          {unreadCount > 0 && (
            <div className="new-alert-banner">
              ⚠️ {unreadCount} unread security alert{unreadCount > 1 ? 's' : ''}
            </div>
          )}
          
          <div className="notifications-list">
            {notifications.map((notif) => (
              <div key={notif.id} className={`notification-item ${!notif.is_read ? 'unread' : ''}`}>
                <div className="notif-header">
                  <span className={`notif-type type-${notif.notification_type}`}>
                    {notif.notification_type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="notif-date">
                    {new Date(notif.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="notif-student">Student: {notif.student_email}</p>
                {notif.ip_address && <p className="notif-ip">IP: {notif.ip_address}</p>}
                {notif.course_title && <p className="notif-course">Course: {notif.course_title}</p>}
                {notif.video_title && <p className="notif-video">Video: {notif.video_title}</p>}
                {notif.description && <p className="notif-desc">{notif.description}</p>}
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="empty-state">
                <p>No security alerts. System is secure.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="nav-links">
        <Link to="/admin/users" className="btn-link">Manage Users →</Link>
      </div>

      <style>{`
        .new-alert-banner {
          background: #dc3545;
          color: white;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 15px;
          font-weight: bold;
          text-align: center;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .notification-item.unread {
          border-left: 4px solid #dc3545;
          background: #fff5f5;
        }
        
        .type-screenshot { color: #dc3545; }
        .type-screen_record { color: #dc3545; }
        .type-right_click { color: #fd7e14; }
        .type-download { color: #ffc107; }
        .type-watermark { color: #20c997; }
      `}</style>
    </div>
  );
}
