import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function TrainerDashboard() {
  const { user } = useAuth();
  const [myCourses, setMyCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchData = async () => {
    try {
      // Get courses - backend filters to show trainer's assigned courses
      const coursesRes = await api.get('/courses/');
      setMyCourses(coursesRes.data);
      
      const statsRes = await api.get('/dashboard/stats/');
      setStats(statsRes.data);
      
      // Get security notifications for trainer's courses
      const notifRes = await api.get('/security/notifications/');
      setNotifications(notifRes.data);
      
      // Count unread for trainer's notifications
      const unread = notifRes.data.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Poll for security notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      api.get('/security/notifications/')
        .then(res => {
          const unread = res.data.filter(n => !n.is_read).length;
          setUnreadCount(unread);
          setNotifications(res.data);
        })
        .catch(err => console.error(err));
    }, 3000);

    return () => clearInterval(interval);
  }, []);


  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="trainer-dashboard">
      <h1>Trainer Dashboard</h1>
      <p className="welcome">Welcome, {user?.first_name || user?.email}!</p>
      
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>My Courses</h3>
            <p className="stat-number">{stats.my_courses || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Videos</h3>
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
          My Courses
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
            <h2>My Assigned Courses</h2>
          </div>
          
          <p className="info-message">
            You can only add videos to courses that have been assigned to you by the admin.
          </p>

          <div className="courses-grid">
            {myCourses.map((course) => (
              <div key={course.id} className="course-card-trainer">
                <div className="course-info">
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <span className="course-meta">
                    {course.videos?.length || 0} videos
                    {course.trainer === user?.id ? ' • Assigned to you' : ' • Not assigned'}
                  </span>
                </div>
                <div className="course-actions">
                  <Link to={`/course/${course.id}`} className="btn-primary">
                    {course.trainer === user?.id ? 'Manage Videos' : 'View Course'}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {myCourses.length === 0 && (
            <div className="empty-state">
              <p>No courses have been assigned to you yet.</p>
              <p className="empty-hint">Contact the admin to assign courses to you.</p>
            </div>
          )}
        </>
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
            These alerts are for your assigned courses. You'll be notified when students attempt to screenshot, record, 
            or download your video content. Polls every 30 seconds.
          </p>
          
          {unreadCount > 0 && (
            <div className="new-alert-banner">
              ⚠️ {unreadCount} unread alert{unreadCount > 1 ? 's' : ''}
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
                <p>No security alerts for your courses.</p>
              </div>
            )}
          </div>
        </div>
      )}

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
