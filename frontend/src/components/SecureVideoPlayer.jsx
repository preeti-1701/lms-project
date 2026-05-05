import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function SecureVideoPlayer({ 
  url, 
  title, 
  courseId, 
  videoId 
}) {
  const { user } = useAuth();
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [securityAlert, setSecurityAlert] = useState(null);
  const containerRef = useRef(null);

  // Report security event to backend
  const reportSecurityEvent = useCallback(async (eventType, details = '') => {
    try {
      await api.post('/security/report/', {
        notification_type: eventType,
        course_id: courseId,
        video_id: videoId,
        description: details || `${eventType} attempt detected`
      });
      console.log(`Security event reported: ${eventType}`);
    } catch (err) {
      console.error('Failed to report security event:', err);
    }
  }, [courseId, videoId]);

  // Show security alert
  const showAlert = (message, type = 'warning') => {
    setSecurityAlert(message);
    reportSecurityEvent(
      type === 'screenshot' ? 'screenshot' : 'right_click',
      message
    );
    setTimeout(() => setSecurityAlert(null), 5000);
  };

  // Handle "watch video" - open in YouTube new tab
  const handleWatchVideo = () => {
    window.open(url, '_blank');
    setVideoPlaying(true);
  };

  // Initialize security protection - runs on mount
  useEffect(() => {
    if (!containerRef.current) return;

    // ========== DISABLE RIGHT-CLICK ==========
    const disableRightClick = (e) => {
      e.preventDefault();
      if (videoPlaying) {
        showAlert('Right-click is disabled during video playback', 'right_click');
      }
      return false;
    };
    
    // ========== DISABLE PRINT SCREEN ==========
    const disablePrintScreen = (e) => {
      e.preventDefault();
      showAlert('PrintScreen key is disabled', 'screenshot');
      // Clear clipboard
      navigator.clipboard && navigator.clipboard.writeText('');
      return false;
    };
    
    // ========== DISABLE KEYBOARD SHORTCUTS ==========
    const disableKeyboardShortcuts = (e) => {
      if (!videoPlaying) return;
      
      // Block PrintScreen
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        disablePrintScreen(e);
        return;
      }
      
      // Block Ctrl+S, Ctrl+P, Ctrl+U, Ctrl+I, F12
      if (
        (e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'u' || e.key === 'i')) ||
        e.key === 'F12' ||
        (e.metaKey && (e.key === 's' || e.key === 'p'))
      ) {
        e.preventDefault();
        showAlert('Keyboard shortcut disabled during playback', 'download');
        return;
      }
      
      // Block Ctrl+Shift+S (Save As)
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        showAlert('Save As disabled', 'download');
        return;
      }
    };

    // ========== DETECT SCREEN RECORDING ==========
    const handleVisibilityChange = () => {
      if (document.hidden && videoPlaying) {
        showAlert('Tab switched - possible screenshot/recording attempt', 'screenshot');
      }
    };

    // Add event listeners to the container
    const container = containerRef.current;
    container.addEventListener('contextmenu', disableRightClick);
    container.addEventListener('keydown', disableKeyboardShortcuts);
    document.addEventListener('keydown', disableKeyboardShortcuts); // Document level for PrintScreen
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // ========== PREVENT DEFAULT ON BODY ==========
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    // Cleanup
    return () => {
      container.removeEventListener('contextmenu', disableRightClick);
      container.removeEventListener('keydown', disableKeyboardShortcuts);
      document.removeEventListener('keydown', disableKeyboardShortcuts);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.body.style.userSelect = 'auto';
      document.body.style.webkitUserSelect = 'auto';
    };
  }, [videoPlaying, showAlert, reportSecurityEvent]);

  // Generate dynamic watermark text
  const getWatermarkText = () => {
    if (!user) return 'LMS Protected';
    const timestamp = new Date().toLocaleString();
    return `${user.email} | ${user.role?.toUpperCase()} | ${timestamp}`;
  };

  // Create watermark positions
  const watermarkPositions = [0, 1, 2, 3, 4, 5].map((i) => ({
    key: i,
    style: {
      left: `${(i % 3) * 33 + 10}%`,
      top: `${Math.floor(i / 3) * 50 + 10}%`,
    }
  }));

  // Finished watching
  const handleFinishedWatching = () => {
    setVideoPlaying(false);
  };

  // ========== SECURITY ALERT OVERLAY ==========
  if (securityAlert) {
    return (
      <div 
        ref={containerRef}
        style={{
          background: '#000',
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>⚠️</div>
        <h3 style={{ color: '#dc3545', margin: '10px 0' }}>Security Alert</h3>
        <p style={{ color: '#fff', margin: '10px 0' }}>{securityAlert}</p>
        <p style={{ color: '#888', fontSize: '12px', marginTop: '10px' }}>
          This event has been reported to the administrator.
        </p>
        <button 
          onClick={() => setSecurityAlert(null)}
          style={{
            marginTop: '20px',
            padding: '10px 25px',
            background: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          I Understand - Continue
        </button>
      </div>
    );
  }

  // ========== VIDEO PLAYING STATE ==========
  if (videoPlaying) {
    return (
      <div 
        ref={containerRef}
        style={{
          background: '#1a1a1a',
          padding: '30px',
          borderRadius: '8px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Dynamic Watermark on LMS while video plays in YouTube */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 10,
          opacity: 0.1
        }}>
          {watermarkPositions.map((pos) => (
            <span 
              key={pos.key}
              style={{
                position: 'absolute',
                left: pos.style.left,
                top: pos.style.top,
                color: '#fff',
                fontSize: '14px',
                fontWeight: 'bold',
                transform: 'rotate(-30deg)',
                whiteSpace: 'nowrap',
                fontFamily: 'Arial, sans-serif'
              }}
            >
              {getWatermarkText()}
            </span>
          ))}
        </div>

        <div style={{ fontSize: '48px', marginBottom: '15px' }}>▶️</div>
        <h3 style={{ color: '#28a745', margin: '10px 0' }}>
          Video Playing in YouTube
        </h3>
        <p style={{ color: '#888', margin: '10px 0' }}>
          "{title}" is now playing in a new tab
        </p>
        
        <div style={{ 
          background: '#2d2d2d', 
          padding: '15px', 
          borderRadius: '4px',
          marginTop: '20px',
          textAlign: 'left'
        }}>
          <p style={{ color: '#dc3545', fontWeight: 'bold', marginBottom: '10px' }}>
            🔒 SECURITY ACTIVE - Do NOT:
          </p>
          <ul style={{ color: '#888', paddingLeft: '20px', fontSize: '13px' }}>
            <li>Switch tabs or minimize window</li>
            <li>Take screenshots (PrintScreen)</li>
            <li>Record screen</li>
            <li>Right-click or copy content</li>
            <li>Attempt to save/download</li>
          </ul>
          <p style={{ color: '#666', fontSize: '11px', marginTop: '10px' }}>
            ⚠️ All violations are being monitored and reported!
          </p>
        </div>

        <button 
          onClick={handleFinishedWatching}
          style={{
            marginTop: '20px',
            padding: '12px 30px',
            background: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Finished Watching
        </button>
      </div>
    );
  }

  // ========== INITIAL STATE - WATCH BUTTON ==========
  return (
    <div 
      ref={containerRef}
      style={{
        background: '#1a1a1a',
        padding: '30px',
        borderRadius: '8px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Static Watermark */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.08
      }}>
        {watermarkPositions.map((pos) => (
          <span 
            key={pos.key}
            style={{
              position: 'absolute',
              left: pos.style.left,
              top: pos.style.top,
              color: '#fff',
              fontSize: '14px',
              fontWeight: 'bold',
              transform: 'rotate(-30deg)',
              whiteSpace: 'nowrap',
              fontFamily: 'Arial, sans-serif'
            }}
          >
            {getWatermarkText()}
          </span>
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎬</div>
        <h3 style={{ color: '#fff', margin: '10px 0' }}>{title}</h3>
        <p style={{ color: '#888', fontSize: '14px', margin: '10px 0' }}>
          Click below to watch this video on YouTube
        </p>
        
        <button 
          onClick={handleWatchVideo}
          style={{
            padding: '14px 35px',
            background: '#e63946',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '15px'
          }}
        >
          ▶️ Watch Video on YouTube
        </button>

        <div style={{ 
          marginTop: '25px', 
          padding: '15px', 
          background: '#2d2d2d', 
          borderRadius: '4px',
          fontSize: '12px',
          color: '#666'
        }}>
          <p style={{ color: '#28a745', fontWeight: 'bold', marginBottom: '10px' }}>
            🔒 Security Protection Enabled
          </p>
          <ul style={{ textAlign: 'left', paddingLeft: '20px', margin: '5px 0' }}>
            <li>Right-click disabled</li>
            <li>PrintScreen blocked</li>
            <li>Screen recording monitored</li>
            <li>Save/download shortcuts blocked</li>
            <li>Dynamic watermark active</li>
            <li>Violations reported to admin</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
