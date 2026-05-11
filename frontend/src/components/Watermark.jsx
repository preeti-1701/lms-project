import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { logSecurityAlert } from '../utils/security';

const Watermark = () => {
  const { user } = useAuth();
  const [watermarkText, setWatermarkText] = useState('');
  const [deviceInfo, setDeviceInfo] = useState({});

  useEffect(() => {
    // Get device info
    const getDeviceInfo = () => {
      const screen = `${window.screen.width}x${window.screen.height}`;
      const browser = navigator.userAgent;
      const language = navigator.language;
      return { screen, browser, language };
    };

    setDeviceInfo(getDeviceInfo());
    
    // Generate dynamic watermark
    const now = new Date();
    const watermark = `
      🔒 PROTECTED CONTENT
      User: ${user?.email || 'Unknown'}
      Name: ${user?.name || 'Unknown'}
      Date: ${now.toLocaleDateString()}
      Time: ${now.toLocaleTimeString()}
      IP: Tracked
      Device: ${getDeviceInfo().screen}
    `;
    setWatermarkText(watermark.trim());

    // Detect screenshot attempts
    const detectScreenshot = () => {
      // Detect Print Screen key
      const handleKeyDown = async (e) => {
        if (e.key === 'PrintScreen') {
          e.preventDefault();
          await logSecurityAlert('print_screen_attempt', { 
            key: 'PrintScreen', 
            timestamp: new Date().toISOString(),
            url: window.location.href
          });
          showSecurityWarning('📸 Screenshot attempt detected! This has been reported to admin.');
          return false;
        }
        
        // Detect Ctrl+Shift+3 (Mac screenshot)
        if (e.ctrlKey && e.shiftKey && (e.key === '3' || e.key === '4')) {
          e.preventDefault();
          await logSecurityAlert('screenshot_attempt', {
            combination: 'Ctrl+Shift+' + e.key,
            timestamp: new Date().toISOString()
          });
          showSecurityWarning('⚠️ Screenshot attempt detected! This activity is being monitored.');
          return false;
        }
      };

      // Detect visibility change (could be screen recording)
      const handleVisibilityChange = async () => {
        if (document.hidden) {
          await logSecurityAlert('tab_switch', {
            action: 'User switched tabs',
            timestamp: new Date().toISOString()
          });
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    };

    detectScreenshot();
  }, [user]);

  return (
    <>
      {/* Fixed Watermark */}
      <div style={{
        position: 'fixed',
        bottom: '15px',
        right: '15px',
        background: 'rgba(0,0,0,0.75)',
        color: 'rgba(255,255,255,0.85)',
        padding: '8px 15px',
        borderRadius: '8px',
        fontSize: '10px',
        fontFamily: 'monospace',
        zIndex: 9999,
        pointerEvents: 'none',
        backdropFilter: 'blur(5px)',
        borderLeft: '3px solid #ff4444',
        textAlign: 'right',
        lineHeight: '1.4',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}>
        <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
          🛡️ SECURE STREAM
        </div>
        <div>{user?.email}</div>
        <div>{new Date().toLocaleDateString()}</div>
      </div>

      {/* Transparent Overlay Watermark (background) */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 9998,
        background: `repeating-linear-gradient(
          45deg,
          rgba(0,0,0,0.03) 0px,
          rgba(0,0,0,0.03) 100px,
          transparent 100px,
          transparent 200px
        )`
      }} />
    </>
  );
};

export default Watermark;