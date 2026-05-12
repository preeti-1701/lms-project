import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const TrainerDashboard = () => {
  const [name] = useState(localStorage.getItem('name') || 'Trainer');
  const [courses, setCourses] = useState([]);
  const [courseData, setCourseData] = useState({ title: '', description: '' });
  const [videoData, setVideoData] = useState({ courseId: '', youtubeLink: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const res = await api.get('/course/all');
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

  const handleCreateCourse = async (event) => {
    event.preventDefault();
    try {
      await api.post('/course/create', courseData);
      setMessage('Course created successfully');
      setCourseData({ title: '', description: '' });
      fetchCourses();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create course');
    }
  };

  const handleAddVideo = async (event) => {
    event.preventDefault();
    try {
      await api.post('/video/add', videoData);
      setMessage('Video added successfully');
      setVideoData({ courseId: '', youtubeLink: '' });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add video');
    }
  };

  return (
    <div className="page-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="section-title">Trainer Dashboard</h1>
        <button className="action-button" onClick={handleLogout}>Logout</button>
      </div>
      <p className="small-text">Welcome, {name}. Create courses and attach YouTube videos.</p>

      <div className="grid" style={{ marginTop: 24 }}>
        <div className="card">
          <h2>Create Course</h2>
          <form onSubmit={handleCreateCourse} className="grid">
            <input
              className="input-field"
              placeholder="Course title"
              value={courseData.title}
              onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
            />
            <textarea
              className="textarea-field"
              placeholder="Course description"
              rows="4"
              value={courseData.description}
              onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
            />
            <button className="action-button" type="submit">Create Course</button>
          </form>
        </div>

        <div className="card">
          <h2>Add Video</h2>
          <form onSubmit={handleAddVideo} className="grid">
            <select
              className="select-field"
              value={videoData.courseId}
              onChange={(e) => setVideoData({ ...videoData, courseId: e.target.value })}
            >
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
            <input
              className="input-field"
              placeholder="YouTube watch link"
              value={videoData.youtubeLink}
              onChange={(e) => setVideoData({ ...videoData, youtubeLink: e.target.value })}
            />
            <button className="action-button" type="submit">Add Video</button>
          </form>
        </div>
      </div>

      {message && <div className="small-text" style={{ marginTop: 12 }}>{message}</div>}

      <div className="card" style={{ marginTop: 24 }}>
        <h2>All Courses</h2>
        <ul>
          {courses.map((course) => (
            <li key={course.id}>{course.title} — {course.trainer_name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TrainerDashboard;
