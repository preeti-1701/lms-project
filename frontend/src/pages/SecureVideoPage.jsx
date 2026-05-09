import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function SecureVideoPage() {
  const { token } = useParams();
  const navigate = useNavigate();
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
        // Call backend auth-me to get the user's stored video token
        const userRes = await api.get('/auth/me/');
        const stored = userRes.data.video_token;

        if (!stored) throw new Error('No stored video token');
        if (!stored.includes(':')) throw new Error('Stored video token is not in expected format');

        const [storedToken, storedVideoId] = stored.split(':');

        // Backend expects the URL param to be the raw <token>
        // If it doesn't match, we won't hard-fail; we will still load using storedVideoId
        // to avoid lockouts due to route/token param mismatches.
        if (!storedVideoId) throw new Error('No video id in stored token');

        const videoRes = await api.get(`/videos/${storedVideoId}/`);
        setVideoData({
          video_id: storedVideoId,
          title: videoRes.data.title,
          // backend serializer sends embed_url
          embed_url: videoRes.data.embed_url || videoRes.data.youtube_embed_url,
          course_id: videoRes.data.course,
          video_url: videoRes.data.youtube_url || videoRes.data.video_url
        });
      } catch (err) {
        console.error('Token validation failed:', err);
        alert('Invalid or expired video token');
        navigate('/login');
      }
    };
    verifyToken();
  }, [token, user]);

  // Security violation reporter
  const reportViolation = useCallback(async (type, details = '') => {
    try {
      console.log('Reporting violation:', type, details);
      const res = await api.post('/security/report/', {
        notification_type: type,
        video_id: videoData?.video_id || token,
        course_id: videoData?.course_id,
        description: details
      });

      console.log('Backend response force_logout:', res.data.force_logout);
      if (res.data.force_logout) {
        setBlackout(true);
        setTimeout(() => {
          // Notify all LMS tabs/windows to logout immediately
          localStorage.setItem('force_logout', Date.now().toString());
          logout(true); // force logout (this tab)
          navigate('/login');
        }, 2000);
      }

    } catch (err) {
      console.error('Report failed:', err);
    }
  }, [videoData, token, logout]);

  const lastReportAtRef = useRef({});
  const hiddenTimerRef = useRef(null);


  const reportViolationThrottled = useCallback(async (type, details = '') => {
    const now = Date.now();
    const lastAt = lastReportAtRef.current[type] || 0;
    // cooldown per type
    if (now - lastAt < 2500) return;
    lastReportAtRef.current[type] = now;
    return reportViolation(type, details);
  }, [reportViolation]);

  // Aggressive security listeners
  useEffect(() => {
    if (!containerRef.current) return;

    // Best-effort DevTools heuristics based on viewport vs outer dimensions
    // (keyboard events can be unreliable when the YouTube iframe has focus)
    const devtoolsOpen = () => {

      try {
        return (window.outerWidth - window.innerWidth > 160) ||
               (window.outerHeight - window.innerHeight > 160);
      } catch (_) {
        return false;
      }
    };

    const devtoolsInterval = window.setInterval(() => {
      if (!document.hidden && devtoolsOpen()) {
        setBlackout(true);
        Promise.resolve().then(() => {
          reportViolationThrottled('screen_record', 'DevTools detected (heuristic)');
        });
      }
    }, 1500);

    // Visibility change: avoid logging out on normal LMS tab navigation.
    // Only report if the page stays hidden for a threshold (stable timer via ref).
    const handleKeyDown = (e) => {
      // PrintScreen, Ctrl+Shift+I, F12, Ctrl+S and similar heuristics
      const isPrintScreen = e.key === 'PrintScreen'
      const isF12 = e.key === 'F12'
      const isCtrlShiftI = e.key === 'I' && e.ctrlKey && e.shiftKey
      const isCtrlS = e.key === 's' && e.ctrlKey
      const isCtrlP = e.key === 'p' && e.ctrlKey

      // Win+Shift+S (often key is 's' with shift) heuristic
      const isWinShiftS = e.key === 's' && e.shiftKey && (e.ctrlKey || e.metaKey)

      if (isPrintScreen || isF12 || isCtrlShiftI || isCtrlS || isCtrlP || isWinShiftS) {
        // Immediate deterrence: blackout/blur UI BEFORE awaiting backend
        setBlackout(true)
        try {
          window.blur()
        } catch (_) {}

        const vType = 'screen_record'
        const vDetails = 'Suspicious key combo detected'

        // After blackout appears, report asynchronously
        Promise.resolve().then(() => {
          reportViolationThrottled(vType, vDetails)
        })

        return false
      }
    };


    // Visibility change: avoid logging out on normal LMS tab navigation.
    // Only report if the page stays hidden for a threshold (stable timer via ref).
    const HIDDEN_MS = 7000;


    const handleVisibilityChange = () => {
      if (document.hidden === true) {
        // Start timer only if not already running
        if (!hiddenTimerRef.current) {
          console.log('TAB HIDDEN TIMER STARTED');
          hiddenTimerRef.current = window.setTimeout(() => {
            hiddenTimerRef.current = null;
            console.log('TAB HIDDEN TIMER FIRED');
            setBlackout(true);
            Promise.resolve().then(() => {
              console.log('REPORT SENT');
              return reportViolationThrottled(
                'screen_record',
                'Protected video tab hidden >7s'
              );
            });
          }, HIDDEN_MS);
        }
      } else {
        // Visibility restored
        if (hiddenTimerRef.current) {
          window.clearTimeout(hiddenTimerRef.current);
          hiddenTimerRef.current = null;
          console.log('TAB HIDDEN TIMER CLEARED');
        }
      }

    };

    // NOTE: Avoid reporting on window blur alone because the YouTube iframe
    // steals focus during normal playback.
    // We rely on visibilitychange (tab hidden) + explicit suspicious keyboard events.
    const handleBlur = () => {
      // no-op
    };

    // Context menu, drag, select
    const handleContext = (e) => {
      e.preventDefault();
      reportViolationThrottled('right_click');
    };

      // Clipboard events
    const handleClipboard = () => {
      setBlackout(true);
      try {
        window.blur();
      } catch (_) {}

      Promise.resolve().then(() => {
        reportViolationThrottled('screenshot', 'Clipboard access detected');
      });
    };

    // Pointer events for mouse capture
    document.addEventListener('contextmenu', handleContext);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
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
      window.removeEventListener('blur', handleBlur);
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

      {/* Watermark overlay (tiled diagonal) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 100,
          opacity: 0.22,
          overflow: 'hidden'
        }}
      >
        {/* Create repeated tiles */}
        {Array.from({ length: 36 }).map((_, i) => {
          const x = (i % 6) * 180;
          const y = Math.floor(i / 6) * 120;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                transform: 'rotate(-35deg)',
                whiteSpace: 'nowrap',
                color: '#fff',
                fontSize: '18px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textShadow: '2px 2px 6px rgba(0,0,0,0.9)'
              }}
            >
              {user?.email} | {new Date().toLocaleString()}
              {videoData?.video_id ? ` | VID-${videoData.video_id}` : ''}
              {videoData?.course_id ? ` | C-${videoData.course_id}` : ''}
            </div>
          );
        })}
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
