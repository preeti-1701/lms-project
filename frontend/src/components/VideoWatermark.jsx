import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const VideoWatermark = ({ videoTitle }) => {
  const { user } = useAuth();

  const logSecurityAlert = async (alertType, details = {}) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('No token found');
      return;
    }
    
    try {
      const response = await axios.post(
        'http://localhost:8000/api/users/auth/security_alert/',
        { alert_type: alertType, details },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      console.log('Alert sent:', alertType, response.data);
    } catch (error) {
      console.error('Failed to log alert:', error.response?.data || error.message);
    }
  };

  const showWarning = (message) => {
    const warning = document.createElement('div');
    warning.innerHTML = `
      <div style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); 
                  background: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; 
                  z-index: 10000; font-size: 14px; font-weight: bold;
                  box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
        ⚠️ ${message}
      </div>
    `;
    document.body.appendChild(warning);
    setTimeout(() => warning.remove(), 3000);
  };

  useEffect(() => {
    if (!user) return;

    console.log('VideoWatermark mounted for user:', user.email);

    // Add watermark on video
    const addVideoWatermark = () => {
      const existingWatermark = document.getElementById('video-watermark');
      if (existingWatermark) existingWatermark.remove();
      
      const watermarkDiv = document.createElement('div');
      watermarkDiv.id = 'video-watermark';
      watermarkDiv.innerHTML = `
        <div style="position: fixed; bottom: 20px; right: 20px; 
                    background: rgba(0,0,0,0.85); color: rgba(255,255,255,0.95); 
                    padding: 12px 20px; border-radius: 10px; font-size: 11px; 
                    font-family: monospace; z-index: 9999; pointer-events: none;
                    backdrop-filter: blur(8px); border-left: 4px solid #ef4444;
                    text-align: right; line-height: 1.5;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
          <div style="font-size: 12px; font-weight: bold; margin-bottom: 6px; color: #ef4444;">🔒 PROTECTED VIDEO</div>
          <div>👤 ${user?.email || 'Unknown'}</div>
          <div>📛 ${user?.name || 'Unknown'}</div>
          <div>🎬 ${videoTitle || 'Video'}</div>
          <div>📅 ${new Date().toLocaleDateString()}</div>
          <div>⏰ ${new Date().toLocaleTimeString()}</div>
        </div>
      `;
      document.body.appendChild(watermarkDiv);
    };

    addVideoWatermark();
    const interval = setInterval(addVideoWatermark, 60000);

    // DETECT PRINT SCREEN - This is the key
    const handleKeyDown = async (e) => {
      console.log('Key pressed:', e.key);
      
      // Detect Print Screen key
      if (e.key === 'PrintScreen') {
        console.log('Print Screen detected!');
        e.preventDefault();
        
        // Send alert to backend
        await logSecurityAlert('print_screen_attempt', {
          key: 'PrintScreen',
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        });
        
        showWarning('📸 Screenshot attempt detected! This has been reported to admin.');
        return false;
      }
      
      // Detect Ctrl+S
      if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        console.log('Ctrl+S detected!');
        e.preventDefault();
        await logSecurityAlert('save_attempt', {
          combination: 'Ctrl+S',
          timestamp: new Date().toISOString()
        });
        showWarning('💾 Saving is disabled on this page');
        return false;
      }
      
      // Detect F12 or Ctrl+Shift+I
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i'))) {
        console.log('Dev tools detected!');
        e.preventDefault();
        await logSecurityAlert('dev_tools_attempt', {
          method: e.key === 'F12' ? 'F12' : 'Ctrl+Shift+I',
          timestamp: new Date().toISOString()
        });
        showWarning('🛠️ Developer tools are disabled');
        return false;
      }
    };

    // Detect Right Click
    const handleRightClick = async (e) => {
      console.log('Right click detected!');
      e.preventDefault();
      await logSecurityAlert('right_click_attempt', {
        target: e.target.tagName,
        timestamp: new Date().toISOString()
      });
      showWarning('🖱️ Right-click is disabled on video player');
      return false;
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleRightClick);

    return () => {
      clearInterval(interval);
      const watermark = document.getElementById('video-watermark');
      if (watermark) watermark.remove();
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleRightClick);
    };
  }, [user, videoTitle]);

  return null;
};

export default VideoWatermark;