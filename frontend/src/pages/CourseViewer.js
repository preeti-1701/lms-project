import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import Watermark from '../components/Watermark';
import Navbar from '../components/Navbar';

const CourseViewer = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [newVideo, setNewVideo] = useState({ title: '', youtube_url: '', description: '' });

  useEffect(() => {
    fetchCourseData();
    // SRS Security: Disable right-click
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    
    // SRS Security: Disable print screen / certain shortcuts
    const handleKeyDown = (e) => {
      if (e.key === 'PrintScreen') {
        alert('Screenshots are disabled for security reasons.');
        e.preventDefault();
      }
      if ((e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [id]);

  const fetchCourseData = async () => {
    try {
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data);
      if (res.data.videos.length > 0) {
        setCurrentVideo(res.data.videos[0]);
      }
    } catch (err) {
      alert('Access denied or course not found');
      navigate('/');
    }
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    await api.post('/videos', { ...newVideo, course_id: id });
    setNewVideo({ title: '', youtube_url: '', description: '' });
    setShowAddVideo(false);
    fetchCourseData();
  };

  if (!course) return <div>Loading...</div>;

  return (
    <div className="bg-course" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Navbar />
      <div className="dashboard-layout unselectable" style={{ flexGrow: 1 }}>
        <div className="sidebar" style={{ overflowY: 'auto' }}>
        <button onClick={() => navigate(-1)} className="btn" style={{ marginBottom: '1rem', background: '#334155' }}>← Back</button>
        <h3>{course.title}</h3>
        <div style={{ marginTop: '1.5rem' }}>
          {course.videos.map(v => (
            <div 
              key={v.id} 
              className={`nav-item ${currentVideo?.id === v.id ? 'active' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setCurrentVideo(v)}
            >
              {v.title}
            </div>
          ))}
          {(user.role === 'admin' || user.role === 'trainer') && (
            <button className="btn" style={{ marginTop: '1rem', fontSize: '0.875rem' }} onClick={() => setShowAddVideo(true)}>+ Add Video</button>
          )}
        </div>
      </div>
      
      <div className="main-content" style={{ padding: 0 }}>
        {currentVideo ? (
          <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
            <div className="video-container" style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 12px 36px rgba(0,0,0,0.4)' }}>
              <iframe
                src={`https://www.youtube.com/embed/${currentVideo.youtube_id}?rel=0&modestbranding=1&showinfo=0`}
                title={currentVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <Watermark />
            </div>
            <div className="card" style={{ marginTop: '2rem', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)' }}>
              <h2 style={{ color: 'var(--primary)' }}>{currentVideo.title}</h2>
              <p style={{ marginTop: '1rem', lineHeight: '1.6', color: '#cbd5e1' }}>{currentVideo.description}</p>
            </div>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Select a video from the sidebar to begin learning.</h2>
          </div>
        )}

        {showAddVideo && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyCenter: 'center', zIndex: 100 }}>
             <div className="card" style={{ width: '400px', margin: 'auto' }}>
                <h3>Add Video</h3>
                <form onSubmit={handleAddVideo} style={{ marginTop: '1rem' }}>
                  <div className="form-group">
                    <label>Video Title</label>
                    <input type="text" value={newVideo.title} onChange={(e) => setNewVideo({...newVideo, title: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>YouTube URL</label>
                    <input type="url" value={newVideo.youtube_url} onChange={(e) => setNewVideo({...newVideo, youtube_url: e.target.value})} required placeholder="https://youtube.com/watch?v=..." />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem' }} value={newVideo.description} onChange={(e) => setNewVideo({...newVideo, description: e.target.value})} rows="3"></textarea>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="btn">Add</button>
                    <button type="button" className="btn" style={{ background: 'var(--secondary)' }} onClick={() => setShowAddVideo(false)}>Cancel</button>
                  </div>
                </form>
             </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default CourseViewer;
