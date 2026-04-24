import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function VideoPlayer() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = localStorage.getItem('email');
  const video = state?.video;
  const courseTitle = state?.courseTitle;
  const watermarkRef = useRef();

  const getYoutubeId = (url) => {
    const match = url?.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    const handleRightClick = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleRightClick);
    const interval = setInterval(() => {
      if (watermarkRef.current) {
        const top = Math.floor(Math.random() * 70) + 5;
        const left = Math.floor(Math.random() * 60) + 5;
        watermarkRef.current.style.top = top + '%';
        watermarkRef.current.style.left = left + '%';
      }
    }, 5000);
    return () => {
      document.removeEventListener('contextmenu', handleRightClick);
      clearInterval(interval);
    };
  }, []);

  if (!video) return (
    <div style={{ padding: 40, color: '#fff', background: '#111', minHeight: '100vh' }}>
      Video not found. <span style={{ color: '#1D9E75', cursor: 'pointer' }} onClick={() => navigate(-1)}>Go back</span>
    </div>
  );

  const videoId = getYoutubeId(video.youtube_url);

  return (
    <div style={s.container}>
      <div style={s.topbar}>
        <button style={s.back} onClick={() => navigate(-1)}>← Back</button>
        <span style={s.courseTitle}>{courseTitle}</span>
      </div>
      <div style={s.playerWrap}>
        <div style={s.playerBox}>
          <div ref={watermarkRef} style={s.watermark}>
            {email} · {new Date().toLocaleTimeString()}
          </div>
          {videoId ? (
            <iframe style={s.iframe}
              src={`https://www.youtube-nocookie.com/embed/${videoId}?modestbranding=1&rel=0&disablekb=1`}
              title={video.title} frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen />
          ) : (
            <div style={s.noVideo}>Invalid YouTube URL</div>
          )}
        </div>
        <div style={s.info}>
          <h2 style={s.videoTitle}>{video.title}</h2>
          <div style={s.badges}>
            <span style={s.badge}>No download</span>
            <span style={s.badge}>Watermarked</span>
            <span style={s.badge}>Right-click disabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  container: { minHeight: '100vh', background: '#111' },
  topbar: { background: '#1a1a1a', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16 },
  back: { background: 'none', border: '1px solid #444', color: '#fff', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  courseTitle: { color: '#aaa', fontSize: 14 },
  playerWrap: { maxWidth: 900, margin: '0 auto', padding: 24 },
  playerBox: { position: 'relative', paddingTop: '56.25%', background: '#000', borderRadius: 12, overflow: 'hidden' },
  iframe: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' },
  watermark: { position: 'absolute', top: '10%', left: '10%', zIndex: 10, color: 'rgba(255,255,255,0.35)', fontSize: 13, fontWeight: 500, pointerEvents: 'none', userSelect: 'none', transition: 'top 1s, left 1s', whiteSpace: 'nowrap' },
  noVideo: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#fff' },
  info: { marginTop: 20 },
  videoTitle: { color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 12 },
  badges: { display: 'flex', gap: 8 },
  badge: { fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#1D9E75', color: '#fff', fontWeight: 500 },
};

export default VideoPlayer;