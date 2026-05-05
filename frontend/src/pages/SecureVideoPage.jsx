import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function SecureVideoPage() {
  const { token } = useParams();
  const { user, logout } = useAuth();
  const [videoData, setVideoData] = useState(null);
  const [violationActive, setViolationActive] = useState(false);
  const [blackout, setBlackout] = useState(false);
  const containerRef = useRef(null);
  const iframeRef = useRef(null);

  // Validate token and fetch video data
  useEffect(() => {
    if (!token || !user) return;

    const verifyToken = async () => {
      try {
        // Get user data to check stored video_token
        const userRes = await api.get('/auth/me/');
        const stored = userRes.data.video_token;
        if (!stored || !stored.startsWith(token + ':')) {
          throw new Error('Invalid token');
        }

        // Extract video_id from stored token
        const videoId = stored.split(':')[1];
        const videoRes = await api.get(`/videos/${videoId}/`);
        setVideoData({
          video_id: videoId,
          title: videoRes.data.title,
          embed_url: videoRes.data.youtube_embed_url,
          course_id: videoRes.data.course,
          video_url: videoRes.data.youtube_url
        });
      } catch (err) {
        console.error('Token validation failed:', err);
        alert('Invalid or expired video token');
        window.close();
      }
    };
    verifyToken();
  }, [token, user]);

  // Security violation reporter
  const reportViolation = useCallback(async (type, details = '') => {
    try {
      const res = await api.post('/security/report/', {
        notification_type: type,
        video_id: videoData?.video_id || token,
        course_id: videoData?.course_id,
        description: details
      });

      if (res.data.force_logout) {
        setBlackout(true);
        setTimeout(() => {
          logout(true); // force logout
          window.close();
        }, 2000);
      }
    } catch (err) {
      console.error('Report failed:', err);
    }
  }, [videoData, token, logout]);

  // Aggressive security listeners
  useEffect(() => {
    if (!containerRef.current) return;

    const handleKeyDown = (e) => {
      // PrintScreen, Win+Shift+S, Ctrl+PrintScreen
      if (e.key === 'PrintScreen' || 
          (e.key === 's' && e.shiftKey && (e.ctrlKey || e.metaKey)) ||
          (e.ctrlKey && e.key === 'p')) {
        e.preventDefault();
        reportViolation('screenshot', 'PrintScreen detected');
        setBlackout(true);
        return false;
      }
    };

    // Visibility change (tab switch)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        reportViolation('screen_record', 'Tab hidden - possible recording');
        setBlackout(true);
      }
    };

    // Context menu, drag, select
    const handleContext = (e) => {
      e.preventDefault();
      reportViolation('right_click');
    };

    // Clipboard events
    const handleClipboard = () => {
      reportViolation('screenshot', 'Clipboard access detected');
    };

    // Pointer events for mouse capture
    document.addEventListener('contextmenu', handleContext);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleClipboard);
    document.addEventListener('cut', handleClipboard);

    // Prevent text selection and drag
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.ondragstart = () => false;

    return () => {
      document.removeEventListener('contextmenu', handleContext);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleClipboard);
      document.removeEventListener('cut', handleClipboard);
    };
  }, [reportViolation]);

  if (!videoData) {
    return <div style={{padding: '40px', textAlign: 'center'}}>Loading secure video...</div>;
  }

  return (
    <div ref={containerRef} style={{
      height: '100vh',
      width: '100vw',
      background: '#000',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      position: 'relative',
      fontFamily: 'sans-serif'
    }}>
      {/* Blackout overlay on violation */}
      {blackout && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.95)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff',
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{fontSize: '64px', marginBottom: '20px'}}>🚫</div>
          <h1 style={{fontSize: '32px', margin: '0 0 20px 0'}}>SECURITY VIOLATION DETECTED</h1>
          <p style={{fontSize: '18px', margin: '0 0 40px 0', textAlign: 'center'}}>
            Screenshot/recording attempt logged.<br/>
            You are being logged out.
          </p>
        </div>
      )}

      {/* Watermark overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 100,
        opacity: 0.15
      }}>
        {['TL', 'TR', 'BL', 'BR'].map((pos, i) => (
          <div key={i} style={{
            position: 'absolute',
            color: '#fff',
            fontSize: '24px',
            fontWeight: 'bold',
            transform: 'rotate(-45deg)',
            whiteSpace: 'nowrap',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
          }}>
            {pos === 'TL' && {top: '10%', left: '10%'}}
            {pos === 'TR' && {top: '10%', right: '10%'}}
            {pos === 'BL' && {bottom: '10%', left: '10%'}}
            {pos === 'BR' && {bottom: '10%', right: '10%'}}
            <span>{user?.email} | {new Date().toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* YouTube iframe */}
      <iframe
        ref={iframeRef}
        src={videoData.embed_url + '?controls=0&fs=0&rel=0&modestbranding=1&playsinline=1&autoplay=1'}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          position: 'relative',
          zIndex: 1
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        title={videoData.title}
      />

      {/* Close button */}
      {!blackout && (
        <button onClick={() => window.close()} style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 200,
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          ❌ Close
        </button>
      )}
    </div>
  );
}
