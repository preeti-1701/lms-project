import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';

function getYtId(url) {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/|\/embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default function VideoPlayer() {
  const { courseId, videoIndex } = useParams();
  const navigate = useNavigate();
  const { currentUser, courses, getProgress, markVideoWatched, showToast } = useApp();

  const course = courses.find(c => String(c.id) === String(courseId));
  const [activeIdx, setActiveIdx] = useState(parseInt(videoIndex, 10) || 0);
  const progress = getProgress(currentUser?.id);
  const watchedSummary = progress[courseId] || {};
  const watchedCount = typeof watchedSummary.watched === 'number' ? watchedSummary.watched : 0;

  useEffect(() => {
    if (!course) {
      navigate('/');
    }
  }, [course, navigate]);

  const video = course?.videos[activeIdx];
  const ytId = video ? getYtId(video.url) : null;

  const handleVideoEnd = () => {
    if (video) {
      markVideoWatched(currentUser.id, courseId, video.id);
      showToast('Video marked as complete! ✓', 'success');
      if (activeIdx < course.videos.length - 1) {
        setTimeout(() => setActiveIdx(i => i + 1), 1500);
      }
    }
  };

  if (!course) return null;

  return (
    <div className="vp-layout">
      {/* Main Video */}
      <div className="vp-main">
        {/* Top bar */}
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 20px', background:'var(--bg-card)', borderBottom:'1px solid var(--border)' }}>
          <button className="vp-back-btn" onClick={() => navigate(-1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:'0.95rem' }}>{video?.title}</div>
            <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{course.title} · Video {activeIdx + 1} of {course.videos.length}</div>
          </div>
        </div>

        {/* Embed */}
        <div className="vp-embed">
          {ytId ? (
            <iframe
              key={ytId}
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ width:'100%', height:'100%', border:'none' }}
            />
          ) : (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--text-muted)', flexDirection:'column', gap:12 }}>
              <span style={{ fontSize:'3rem' }}>📺</span>
              <p>No video URL available</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', background:'var(--bg-card)', borderTop:'1px solid var(--border)' }}>
          <button
            className="btn-sm btn-sm-primary"
            disabled={activeIdx === 0}
            onClick={() => setActiveIdx(i => i - 1)}
            style={{ opacity: activeIdx === 0 ? 0.4 : 1 }}
          >
            ← Previous
          </button>
          <button className="btn-sm btn-sm-success" onClick={handleVideoEnd}>
            ✓ Mark as Complete
          </button>
          <button
            className="btn-sm btn-sm-primary"
            disabled={activeIdx === course.videos.length - 1}
            onClick={() => setActiveIdx(i => i + 1)}
            style={{ opacity: activeIdx === course.videos.length - 1 ? 0.4 : 1 }}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Sidebar playlist */}
      <div className="vp-sidebar">
        <div className="vp-sidebar-header">
          <span>📚 {course.title}</span>
          <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{watchedCount}/{course.videos.length}</span>
        </div>
        <div className="vp-playlist">
          {course.videos.map((v, i) => {
            const isWatched = i < watchedCount;
            const isActive = i === activeIdx;
            const vid = getYtId(v.url);
            return (
              <div key={v.id} className={`vp-item ${isActive ? 'active' : ''} ${isWatched ? 'watched' : ''}`} onClick={() => setActiveIdx(i)}>
                <div className="vp-num">{isWatched ? '✓' : i + 1}</div>
                {vid && <img src={`https://img.youtube.com/vi/${vid}/default.jpg`} alt="" style={{ width:60, height:34, borderRadius:4, objectFit:'cover', flexShrink:0 }} />}
                <div className="vp-item-info">
                  <div className="vp-item-title">{v.title}</div>
                  <div className="vp-item-dur">{v.duration}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
