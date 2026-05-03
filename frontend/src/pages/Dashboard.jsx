import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [expandedCourse, setExpandedCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/courses/');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const openYouTube = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const toggleCourse = (courseId) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(courseId);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: '40px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>
          Welcome, {user?.name}! 👋
        </h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          {user?.role === 'student' 
            ? 'Click on any course to see videos (opens YouTube in new tab)' 
            : 'Manage your courses from the Manage Courses page'}
        </p>

        <div className="grid">
          {courses.map((course) => (
            <div key={course.id} className="card">
              <h2 className="card-title">📚 {course.title}</h2>
              <p className="card-text">{course.description}</p>
              <p style={{ fontSize: '14px', color: '#888', marginBottom: '15px' }}>
                🎬 {course.video_count || course.videos?.length || 0} videos
              </p>
              
              {user?.role === 'student' && course.videos && course.videos.length > 0 && (
                <div>
                  <button
                    onClick={() => toggleCourse(course.id)}
                    className="btn-primary"
                    style={{ width: '100%', marginBottom: '10px' }}
                  >
                    {expandedCourse === course.id ? '▼ Hide Videos' : '▶ Show Videos'}
                  </button>
                  
                  {expandedCourse === course.id && (
                    <div style={{ marginTop: '15px' }}>
                      {course.videos.sort((a,b) => a.order - b.order).map((video, index) => (
                        <button
                          key={video.id}
                          onClick={() => openYouTube(video.youtube_watch_url || video.youtube_url)}
                          style={{
                            width: '100%',
                            padding: '12px',
                            marginBottom: '8px',
                            backgroundColor: '#f0f0f0',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}
                        >
                          <span>🎬</span>
                          <span>{index + 1}. {video.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {user?.role !== 'student' && course.videos && course.videos.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <p style={{ fontSize: '13px', color: '#666' }}>📹 Videos in this course:</p>
                  {course.videos.slice(0, 3).map(video => (
                    <div key={video.id} style={{ fontSize: '13px', padding: '5px 0' }}>
                      • {video.title}
                    </div>
                  ))}
                  {course.videos.length > 3 && (
                    <div style={{ fontSize: '13px', color: '#888' }}>+ {course.videos.length - 3} more</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>
            No courses available.
            {user?.role !== 'student' && ' Create your first course in Manage Courses!'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;