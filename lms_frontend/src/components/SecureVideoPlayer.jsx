import React, { useEffect, useRef } from 'react';
import './SecureVideoPlayer.css';

const SecureVideoPlayer = ({ videoUrl, title, userEmail }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    const containerElement = containerRef.current;

    if (!videoElement || !containerElement) return;
    const disableContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    const disableKeyboardShortcuts = (e) => {
      // 123: F12, 73/74: I/J, 85: U, 44: PrintScreen
      if (e.keyCode === 123 || 
          (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || 
          (e.ctrlKey && e.keyCode === 85) ||
          e.keyCode === 44) { 
        e.preventDefault();
        alert("Security: Screenshots and developer tools are disabled.");
        return false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("Visibility lost - security monitoring active");
      }
    };

    const disableSelection = (e) => {
      e.preventDefault();
      return false;
    };

    const disableDrag = (e) => {
      e.preventDefault();
      return false;
    };

    containerElement.addEventListener('contextmenu', disableContextMenu);
    document.addEventListener('keydown', disableKeyboardShortcuts);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    containerElement.addEventListener('selectstart', disableSelection);
    containerElement.addEventListener('dragstart', disableDrag);

    const addWatermark = () => {
      const existing = containerElement.querySelector('.video-watermark');
      if (existing) existing.remove();

      const watermark = document.createElement('div');
      watermark.className = 'video-watermark';
      watermark.textContent = `${userEmail} | ${new Date().toLocaleString()}`;

      const top = Math.floor(Math.random() * 80) + 10; 
      const left = Math.floor(Math.random() * 70) + 5; 
      
      watermark.style.top = `${top}%`;
      watermark.style.left = `${left}%`;
      watermark.style.position = 'absolute';
      
      containerElement.appendChild(watermark);
    };

    addWatermark();
    const watermarkInterval = setInterval(addWatermark, 5000);

    return () => {
      containerElement.removeEventListener('contextmenu', disableContextMenu);
      document.removeEventListener('keydown', disableKeyboardShortcuts);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      containerElement.removeEventListener('selectstart', disableSelection);
      containerElement.removeEventListener('dragstart', disableDrag);
      clearInterval(watermarkInterval);
      
      const existingWatermark = containerElement.querySelector('.video-watermark');
      if (existingWatermark) {
        existingWatermark.remove();
      }
    };
  }, [userEmail]);

  const getYouTubeEmbedUrl = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`;
    }
    return url;
  };

  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  return (
    <div className="secure-video-container" ref={containerRef}>
      <div className="video-wrapper">
        <iframe
          ref={videoRef}
          src={embedUrl}
          title={title}
          className="secure-video-player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default SecureVideoPlayer;
