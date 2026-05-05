import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function StudentDashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-courses');

  const fetchData = async () => {
    try {
      // Get all courses (students should see all for enrollment)
      const allCoursesRes = await api.get('/courses/');
      setAvailableCourses(allCoursesRes.data);
      
      // Get enrollments
      const enrollRes = await api.get('/enrollments/');
      const enrollments = enrollRes.data;
      
      // Map enrolled course IDs
      const enrolledIds = enrollments.map(e => e.course);
      
      // Filter enrolled courses
      const enrolled = allCoursesRes.data.filter(c => enrolledIds.includes(c.id));
      setEnrolledCourses(enrolled);
      
      // Get stats
      const statsRes = await api.get('/dashboard/stats/');
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      await api.post(`/courses/${courseId}/enroll/`);
      alert('Successfully enrolled!');
      fetchData();
    } catch (err) {
      if (err.response?.data?.error) {
        alert(err.response.data.error);
      } else {
        console.error(err);
      }
    }
  };

  // Calculate available courses (not enrolled)
  const notEnrolledCourses = availableCourses.filter(
    c => !enrolledCourses.some(e => e.id === c.id)
  );

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="student-dashboard">
      <h1>Student Dashboard</h1>
      
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>My Courses</h3>
            <p className="stat-number">{stats.enrolled_courses || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Videos Watched</h3>
            <p className="stat-number">{stats.videos_watched || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Overall Progress</h3>
            <p className="stat-number">{stats.progress_percentage || 0}%</p>
          </div>
        </div>
      )}

      <div className="tabs">
        <button 
          className={activeTab === 'my-courses' ? 'active' : ''} 
          onClick={() => setActiveTab('my-courses')}
        >
          My Courses ({enrolledCourses.length})
        </button>
        <button 
          className={activeTab === 'available' ? 'active' : ''} 
          onClick={() => setActiveTab('available')}
        >
          Browse Courses ({notEnrolledCourses.length})
        </button>
      </div>

      {activeTab === 'my-courses' && (
        <div className="courses-section">
          {enrolledCourses.length === 0 ? (
            <div className="empty-state">
              <p>You haven't enrolled in any courses yet.</p>
              <button 
                className="btn-primary" 
                onClick={() => setActiveTab('available')}
              >
                Browse Courses
              </button>
            </div>
          ) : (
            <div className="courses-grid">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="course-card-student">
                  <div className="course-info">
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <div className="course-meta">
                      <span>{course.videos?.length || 0} videos</span>
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      try {
                        const videoRes = await api.get(`/videos/?course_id=${course.id}`);
                        const firstVideo = videoRes.data[0];
                        if (firstVideo && firstVideo.watch_url) {
                          window.open(firstVideo.watch_url, '_blank', 'noopener,noreferrer');
                        } else {
                          alert('No videos in course');
                        }
                      } catch (err) {
                        alert('Error opening video');
                      }
                    }} 
                    className="btn-primary"
                  >
                    ▶️ Open Secure Video (Protected)
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'available' && (
        <div className="courses-section">
          {notEnrolledCourses.length === 0 ? (
            <div className="empty-state">
              <p>No more courses available to enroll.</p>
              {enrolledCourses.length === 0 && (
                <p className="empty-hint">
                  Ask your admin to create courses first!
                </p>
              )}
            </div>
          ) : (
            <div className="courses-grid">
              {notEnrolledCourses.map((course) => (
                <div key={course.id} className="course-card-available">
                  <div className="course-info">
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <div className="course-meta">
                      <span>{course.videos?.length || 0} videos</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleEnroll(course.id)}
                    className="btn-primary"
                  >
                    Enroll Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
