import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const getVideoEmbed = (link) => {
  if (!link) return '';
  const url = new URL(link);
  const searchParams = url.searchParams;
  const videoId = searchParams.get('v') || link.split('/').pop();
  return `https://www.youtube.com/embed/${videoId}`;
};

const StudentDashboard = () => {
  const [name] = useState(localStorage.getItem('name') || 'Student');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const res = await api.get('/course/student-courses');
      setCourses(res.data.courses);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleSelectCourse = async (course) => {
    setSelectedCourse(course);
    setMessage('');
    try {
      const res = await api.get(`/video/${course.id}`);
      setVideos(res.data.videos);
    } catch (err) {
      setMessage('Unable to load videos for this course');
    }
  };

  return (
    <div className="page-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="section-title">Student Dashboard</h1>
        <button className="action-button" onClick={handleLogout}>Logout</button>
      </div>
      <p className="small-text">Welcome, {name}. View your assigned courses and watch training videos.</p>

      <div className="grid" style={{ marginTop: 24 }}>
        <div className="card">
          <h2>Assigned Courses</h2>
          <ul>
            {courses.map((course) => (
              <li key={course.id}>
                <button
                  className="action-button"
                  style={{ marginBottom: 8 }}
                  onClick={() => handleSelectCourse(course)}
                >
                  {course.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2>{selectedCourse ? `${selectedCourse.title} Videos` : 'Select a course to view videos'}</h2>
          {message && <div className="error-text">{message}</div>}
          {videos.map((video) => (
            <div key={video.id} style={{ marginBottom: 20 }}>
              <iframe
                width="100%"
                height="280"
                src={getVideoEmbed(video.youtube_link)}
                title={`video-${video.id}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
