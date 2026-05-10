import React, { useEffect, useState } from 'react';

const VideoPlayer = ({ url }) => {
  const [userInfo] = useState(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.email || user.username || `User ID: ${user.id}`;
      } catch { return ''; }
    }
    return '';
  });
  
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(url);

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl group border border-gray-800">
      <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
        {/* Dynamic Watermark - deterrence */}
        <div className="transform -rotate-12 opacity-30 pointer-events-none select-none">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="text-white/40 text-xl font-bold whitespace-nowrap p-4 drop-shadow-md">
              {userInfo} - {new Date().toLocaleDateString()}
            </div>
          ))}
        </div>
      </div>
      
      {videoId ? (
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&fs=0`}
          title="Course Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={false}
          className="w-full h-full"
          style={{ pointerEvents: 'auto' }}
        ></iframe>
      ) : (
        <video 
          src={url} 
          controls 
          className="w-full h-full"
          style={{ pointerEvents: 'auto' }}
        />
      )}
      
      {/* Invisible overlay over the player to intercept certain clicks */}
      <div className="absolute inset-0 z-0 pointer-events-none"></div>
    </div>
  );
};

export default VideoPlayer;
