import { useState, useRef, useEffect } from 'react';

export default function VideoPlayer({ 
  url, 
  title, 
  autoplay = false,
  onProgress,
  initialPosition = 0
}) {
  const [videoId, setVideoId] = useState(null);
  const [videoType, setVideoType] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const playerRef = useRef(null);
  const iframeRef = useRef(null);

  // Detect video source type
  useEffect(() => {
    if (!url) {
      setError('No video URL provided');
      return;
    }

    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      setVideoType('youtube');
      
      let id = null;
      if (url.includes('watch?v=')) {
        const params = new URL(url).searchParams;
        id = params.get('v');
      } else if (url.includes('youtu.be/')) {
        id = url.split('youtu.be/')[1]?.split('?')[0];
      } else if (url.includes('embed/')) {
        id = url.split('embed/')[1]?.split('?')[0];
      }
      
      setVideoId(id);
      return;
    }

    // Vimeo
    if (url.includes('vimeo.com')) {
      setVideoType('vimeo');
      const id = url.split('vimeo.com/')[1]?.split('?')[0];
      setVideoId(id);
      return;
    }

    // Direct video file (MP4, WebM, etc.)
    if (url.match(/\.(mp4|webm|ogg|mov|avi)$/i) || url.includes('/api/videos/')) {
      setVideoType('direct');
      setVideoId(url);
      return;
    }

    // Dailymotion
    if (url.includes('dailymotion.com')) {
      setVideoType('dailymotion');
      const id = url.split('dailymotion.com/')[1]?.split('?')[0];
      setVideoId(id);
      return;
    }

    setError('Unsupported video source');
  }, [url]);

  // Handle time update for direct videos
  const handleTimeUpdate = (e) => {
    const video = e.target;
    setCurrentTime(video.currentTime);
    setDuration(video.duration);
    
    if (onProgress && video.duration) {
      const percent = (video.currentTime / video.duration) * 100;
      onProgress(percent);
    }
  };

// Render YouTube player with security wrapper
  if (videoType === 'youtube' && videoId) {
    return (
      <div className="video-player-embed" style={{ position: 'relative' }}>
        {/* Watermark overlay */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: 'none',
          zIndex: 10,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          padding: '20px'
        }}>
          {[...Array(9)].map((_, i) => (
            <span key={i} style={{
              color: 'rgba(255,255,255,0.15)',
              fontSize: '14px',
              fontWeight: 'bold',
              transform: 'rotate(-30deg)',
              whiteSpace: 'nowrap',
              fontFamily: 'Arial, sans-serif'
            }}>
              {title} - Protected
            </span>
          ))}
        </div>
        
        <iframe
          ref={iframeRef}
          width="100%"
          height="400"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&enablejsapi=1&rel=0`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: 'relative', zIndex: 1 }}
        ></iframe>
      </div>
    );
  }

  // Render Vimeo player
  if (videoType === 'vimeo' && videoId) {
    return (
      <div className="video-player-embed">
        <iframe
          ref={iframeRef}
          width="100%"
          height="400"
          src={`https://player.vimeo.com/video/${videoId}?autoplay=${autoplay ? 1 : 0}`}
          title={title}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  // Render Dailymotion player
  if (videoType === 'dailymotion' && videoId) {
    return (
      <div className="video-player-embed">
        <iframe
          ref={iframeRef}
          width="100%"
          height="400"
          src={`https://www.dailymotion.com/embed/video/${videoId}?autoplay=${autoplay ? 1 : 0}`}
          title={title}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  // Render direct video player
  if (videoType === 'direct') {
    return (
      <div className="video-player-direct">
        <video
          ref={playerRef}
          width="100%"
          height="400"
          controls
          autoPlay={autoplay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={(e) => setDuration(e.target.duration)}
        >
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {currentTime > 0 && duration > 0 && (
          <div className="video-progress-bar">
            <span>
              {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} 
              / 
              {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="video-player-error">
        <div className="error-message">
          <p>Unable to play video</p>
          <small>{error}</small>
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className="video-player-loading">
      <p>Loading video player...</p>
    </div>
  );
}
