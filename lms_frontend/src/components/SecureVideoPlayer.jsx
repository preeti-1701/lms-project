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
      if (e.keyCode === 123 || 
          (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || 
          (e.ctrlKey && e.keyCode === 85)) { 
        e.preventDefault();
        return false;
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
    containerElement.addEventListener('selectstart', disableSelection);
    containerElement.addEventListener('dragstart', disableDrag);

    const addWatermark = () => {
      const watermark = document.createElement('div');
      watermark.className = 'video-watermark';
      watermark.textContent = `${userEmail} | ${new Date().toLocaleString()}`;
      containerElement.appendChild(watermark);
    };

    addWatermark();

    return () => {
      containerElement.removeEventListener('contextmenu', disableContextMenu);
      document.removeEventListener('keydown', disableKeyboardShortcuts);
      containerElement.removeEventListener('selectstart', disableSelection);
      containerElement.removeEventListener('dragstart', disableDrag);
      
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
