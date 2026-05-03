import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronLeft, Play } from 'lucide-react';

const StudentCourseView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/courses/${id}`)
      .then(r => {
        setCourse(r.data);
        if (r.data.videos?.length) setActiveVideo(r.data.videos[0]);
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load course'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-loader"><div className="spinner" style={{ width:44, height:44 }} /></div>;
  if (error)   return <div className="alert alert-error" style={{ margin:'40px auto', maxWidth:500 }}>{error}</div>;
  if (!course) return null;

  const videos = [...(course.videos || [])].sort((a,b) => a.order_index - b.order_index);
  const embedUrl = activeVideo
    ? `https://www.youtube.com/embed/${activeVideo.youtube_id}?rel=0&modestbranding=1`
    : null;

  return (
    <div className="anim-fade">
      <button className="btn btn-secondary btn-sm" style={{ marginBottom:20 }} onClick={() => navigate('/student/courses')}>
        <ChevronLeft size={16} /> Back to Courses
      </button>

      <h2 className="page-title" style={{ marginBottom:6 }}>{course.title}</h2>
      {course.trainer && <p style={{ color:'var(--text-2)', fontSize:14, marginBottom:20 }}>👤 Trainer: {course.trainer.name}</p>}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:24 }}>
        {/* Video Player */}
        <div>
          {activeVideo && embedUrl ? (
            <>
              <div className="video-wrap" style={{ position:'relative' }}>
                <iframe
                  src={embedUrl}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                {/* Watermark */}
                <div className="watermark">
                  {[...Array(6)].map((_, i) => (
                    <span key={i} className="watermark-text" style={{ top:`${10+i*15}%`, left:`${5+i*12}%` }}>
                      {user?.name}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ marginTop:16 }}>
                <h3 style={{ fontSize:18, fontWeight:700 }}>{activeVideo.title}</h3>
                {activeVideo.description && <p style={{ color:'var(--text-2)', fontSize:14, marginTop:8, lineHeight:1.7 }}>{activeVideo.description}</p>}
              </div>
            </>
          ) : (
            <div className="empty"><Play style={{ width:64, height:64 }} /><h3>Select a video</h3><p>Choose a lesson from the playlist</p></div>
          )}
        </div>

        {/* Playlist */}
        <div>
          <h4 style={{ fontSize:14, fontWeight:700, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:12 }}>
            Course Content · {videos.length} videos
          </h4>
          {videos.length === 0 ? (
            <p style={{ color:'var(--text-3)', fontSize:14 }}>No videos available yet.</p>
          ) : (
            <div className="video-list">
              {videos.map((v, i) => (
                <div key={v.id} className={`video-item${activeVideo?.id === v.id ? ' active' : ''}`} onClick={() => setActiveVideo(v)}>
                  <div className="video-num">{i + 1}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:500, lineHeight:1.4 }}>{v.title}</div>
                    {v.duration && <div style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>{v.duration}</div>}
                  </div>
                  {activeVideo?.id === v.id && <Play size={14} color="var(--primary)" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {course.description && (
        <div className="card" style={{ marginTop:24 }}>
          <h4 style={{ fontWeight:700, marginBottom:8 }}>About this course</h4>
          <p style={{ color:'var(--text-2)', lineHeight:1.7 }}>{course.description}</p>
        </div>
      )}
    </div>
  );
};

export default StudentCourseView;
