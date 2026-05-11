import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import VideoWatermark from '../components/VideoWatermark';

const VideoPlayer = () => {
  const { videoId } = useParams();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideo();
  }, [videoId]);

  const fetchVideo = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/courses/');
      const courses = response.data;
      for (let course of courses) {
        const found = course.videos?.find(v => v.id === videoId);
        if (found) {
          setVideo(found);
          break;
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    // Extract video ID from various YouTube URL formats
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1]?.split('&')[0];
    } else if (url.includes('embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0];
    }
    return `https://www.youtube.com/embed/${videoId}?modestbranding=1&showinfo=0&controls=1&disablekb=1&fs=0&rel=0`;
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading video...</div>
      </div>
    );
  }

  if (!video) {
    return (
      <div>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '50px' }}>Video not found</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <VideoWatermark videoTitle={video.title} />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px' }}>
        <h2 style={{ marginBottom: '20px' }}>{video.title}</h2>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: '#000', borderRadius: '10px' }}>
          <iframe
            src={getYouTubeEmbedUrl(video.youtube_url)}
            title={video.title}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            frameBorder="0"
            allowFullScreen
          />
        </div>
        <div style={{ marginTop: '20px', padding: '15px', background: '#fef3c7', borderRadius: '8px', textAlign: 'center' }}>
          ⚠️ This video is protected. Screenshot attempts will be logged and reported to admin.
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;