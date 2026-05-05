import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import VideoPlayer from '../components/VideoPlayer';
import SecureVideoPlayer from '../components/SecureVideoPlayer';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState({});
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [videoForm, setVideoForm] = useState({ title: '', url: '', order: '', duration: '' });
  const [loading, setLoading] = useState(true);

  const fetchCourse = async () => {
    try {
      const res = await api.get(`/courses/${id}/`);
      setCourse(res.data);
      
      if (user?.role === 'student') {
        const enrollRes = await api.get(`/enrollments/?course=${id}`);
        const isEnrolled = enrollRes.data.some(e => e.student === user.id);
        setEnrolled(isEnrolled);
        
        if (isEnrolled) {
          const progressRes = await api.get('/progress/');
          const progressMap = {};
          progressRes.data.forEach(p => {
            progressMap[p.video] = p.watched;
          });
          setProgress(progressMap);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id, user]);

  const handleEnroll = async () => {
    try {
      await api.post(`/courses/${id}/enroll/`);
      setEnrolled(true);
      fetchCourse();
    } catch (err) {
      console.error(err);
    }
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        title: videoForm.title,
        youtube_url: videoForm.url,
        order: videoForm.order || 1,
        duration: videoForm.duration
      };
      await api.post('/videos/', { ...data, course: id });
      setVideoForm({ title: '', url: '', order: '', duration: '' });
      setShowVideoForm(false);
      fetchCourse();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!confirm('Delete this video?')) return;
    try {
      await api.delete(`/videos/${videoId}/`);
      fetchCourse();
    } catch (err) {
      console.error(err);
    }
  };

const handleMarkWatched = async (videoId, videoUrl) => {
    try {
      const progressList = await api.get('/progress/');
      const existing = progressList.data.find(p => p.video === videoId);
      
      if (existing) {
        await api.put(`/progress/${existing.id}/`, { watched: true });
      } else {
        await api.post('/progress/', { video: videoId, watched: true });
      }
      
      setProgress({ ...progress, [videoId]: true });
    } catch (err) {
      console.error(err);
    }
  };

  // Permission checks
  const isAdmin = user?.role === 'admin';
  const isTrainer = user?.role === 'trainer';
  const isTrainerAssigned = isTrainer && course?.trainer === user?.id;
  const canEdit = isAdmin || isTrainerAssigned;
  const canShowVideos = isAdmin || isTrainer || enrolled;

  if (loading) return <div className="loading">Loading...</div>;
  if (!course) return <div className="error">Course not found</div>;

  const totalVideos = course.videos?.length || 0;
  const watchedCount = Object.values(progress).filter(Boolean).length;
  const progressPercent = totalVideos > 0 ? Math.round((watchedCount / totalVideos) * 100) : 0;

  return (
    <div className="course-detail">
      <div className="course-header">
        <div>
          <h1>{course.title}</h1>
          {course.trainer_name && (
            <p className="course-meta">Trainer: {course.trainer_name}</p>
          )}
        </div>
        <div className="course-actions">
          {user?.role === 'student' && !enrolled && (
            <button onClick={handleEnroll} className="btn-primary">Enroll Now</button>
          )}
          {user?.role === 'student' && enrolled && (
            <span className="enrolled-badge">✓ Enrolled</span>
          )}
        </div>
      </div>

      <p className="course-description">{course.description}</p>

      {user?.role === 'student' && enrolled && (
        <div className="progress-section">
          <h3>Your Progress: {progressPercent}%</h3>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }}>
              {watchedCount} / {totalVideos} videos
            </div>
          </div>
        </div>
      )}

      {canEdit && (
        <div className="section-header">
          <h2>Videos ({totalVideos})</h2>
          <button 
            className="btn-primary" 
            onClick={() => setShowVideoForm(!showVideoForm)}
          >
            {showVideoForm ? 'Cancel' : '+ Add Video'}
          </button>
        </div>
      )}

      {!canEdit && canShowVideos && <h2>Videos ({totalVideos})</h2>}
      
      {(!canShowVideos && user?.role === 'student' && !enrolled) && (
        <div className="info-message">
          <p>Enroll in this course to view videos.</p>
        </div>
      )}

      {showVideoForm && (
        <form className="video-form" onSubmit={handleVideoSubmit}>
          <h3>Add New Video</h3>
          <input
            type="text"
            placeholder="Video Title"
            value={videoForm.title}
            onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
            required
          />
          <input
            type="url"
            placeholder="YouTube, Vimeo, or Direct Video URL"
            value={videoForm.url}
            onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Order"
            value={videoForm.order}
            onChange={(e) => setVideoForm({ ...videoForm, order: e.target.value })}
            min="1"
          />
          <input
            type="text"
            placeholder="Duration (e.g., 10:30)"
            value={videoForm.duration}
            onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
          />
          <button type="submit" className="btn-primary">Add Video</button>
        </form>
      )}

      <div className="videos-list">
        {canShowVideos && course.videos?.map((video, index) => (
          <div key={video.id} className="video-card">
            <div className="video-info">
              <span className="video-number">{index + 1}</span>
              <div>
                <h3>{video.title}</h3>
                {video.duration && <span className="course-meta">{video.duration}</span>}
                {user?.role === 'student' && enrolled && progress[video.id] && (
                  <span className="watched-badge">✓ Watched</span>
                )}
              </div>
            </div>
            
{video.video_url && enrolled && user?.role === 'student' && (
              <div className="video-player-container">
                <SecureVideoPlayer 
                  url={video.watch_url || video.video_url} 
                  title={video.title}
                  courseId={course.id}
                  videoId={video.id}
                />
                <VideoPlayer 
                  url={video.video_url} 
                  title={video.title}
                />
                {!progress[video.id] && (
                  <button 
                    onClick={() => handleMarkWatched(video.id)}
                    className="btn-primary"
                    style={{ marginTop: '10px' }}
                  >
                    Mark as Watched
                  </button>
                )}
              </div>
            )}
            
            {video.video_url && !enrolled && user?.role !== 'student' && (
              <div className="video-player-container">
                <VideoPlayer url={video.video_url} title={video.title} />
              </div>
            )}
            
            {video.video_url && enrolled && user?.role !== 'student' && (
              <div className="video-player-container">
                <SecureVideoPlayer 
                  url={video.video_url} 
                  title={video.title}
                  courseId={course.id}
                  videoId={video.id}
                />
              </div>
            )}
            
{canEdit && (
              <div className="video-actions">
                <button onClick={() => handleDeleteVideo(video.id)} className="btn-danger">
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
        
        {canShowVideos && (!course.videos || course.videos.length === 0) && (
          <div className="empty-state">
            <p>No videos yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
