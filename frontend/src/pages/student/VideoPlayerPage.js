import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/shared/Layout';
import { Spinner, Card, Button } from '../../components/shared/UI';
import api from '../../utils/api';

const studentNav = [
  { path: '/student', icon: '📚', label: 'My Courses' },
];

export default function VideoPlayerPage() {
  const { courseId, videoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [videoData, setVideoData] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const playerRef = useRef(null);
  const progressInterval = useRef(null);

  // Security: Disable right-click and keyboard shortcuts
  useEffect(() => {
    const noContext = (e) => e.preventDefault();
    const noKeys = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['s', 'u', 'p', 'a'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      if (e.key === 'PrintScreen') e.preventDefault();
    };
    document.addEventListener('contextmenu', noContext);
    document.addEventListener('keydown', noKeys);
    return () => {
      document.removeEventListener('contextmenu', noContext);
      document.removeEventListener('keydown', noKeys);
    };
  }, []);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const [tokenRes, courseRes] = await Promise.all([
          api.get(`/videos/${videoId}/token`),
          api.get(`/courses/${courseId}`),
        ]);
        setVideoData(tokenRes.data.data);
        setCourse(courseRes.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load video');
      }
      setLoading(false);
    };
    fetchVideo();
  }, [videoId, courseId]);

  // Report progress periodically
  useEffect(() => {
    if (!videoData) return;
    let seconds = 0;
    progressInterval.current = setInterval(async () => {
      seconds += 10;
      try {
        await api.post('/progress', { video_id: videoId, watched_seconds: seconds });
      } catch {}
    }, 10000);
    return () => clearInterval(progressInterval.current);
  }, [videoData, videoId]);

  const markComplete = async () => {
    try {
      await api.post('/progress', { video_id: videoId, watched_seconds: 9999, completed: true });
      setCompleted(true);
    } catch {}
  };

  // Watermark position cycles to deter screen recording
  const [wmPos, setWmPos] = useState({ top: '15%', left: '10%' });
  useEffect(() => {
    const positions = [
      { top: '10%', left: '10%' },
      { top: '10%', left: '70%' },
      { top: '75%', left: '10%' },
      { top: '75%', left: '70%' },
      { top: '45%', left: '40%' },
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % positions.length;
      setWmPos(positions[i]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const currentVideo = course?.videos?.find(v => v.id === videoId);
  const videoIndex = course?.videos?.findIndex(v => v.id === videoId) ?? -1;
  const prevVideo = videoIndex > 0 ? course.videos[videoIndex - 1] : null;
  const nextVideo = videoIndex < (course?.videos?.length - 1) ? course.videos[videoIndex + 1] : null;

  if (loading) return <Layout title="Video Player" navItems={studentNav}><Spinner /></Layout>;
  if (error) return (
    <Layout title="Video Player" navItems={studentNav}>
      <Card style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>🔒</div>
        <p style={{ color: '#ef4444', fontWeight: 600 }}>{error}</p>
        <Button style={{ marginTop: 16 }} onClick={() => navigate(`/student/courses/${courseId}`)}>← Back to Course</Button>
      </Card>
    </Layout>
  );

  return (
    <Layout title={currentVideo?.title || 'Video Player'} navItems={studentNav}>
      {/* Navigation breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: '0.8rem', color: '#6b7280' }}>
        <span onClick={() => navigate('/student')} style={{ cursor: 'pointer', color: '#6366f1' }}>My Courses</span>
        <span>›</span>
        <span onClick={() => navigate(`/student/courses/${courseId}`)} style={{ cursor: 'pointer', color: '#6366f1' }}>{course?.title}</span>
        <span>›</span>
        <span style={{ color: '#374151' }}>{currentVideo?.title}</span>
      </div>

      {/* Video container */}
      <div style={{ position: 'relative', userSelect: 'none' }}>
        {/* YouTube iframe */}
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 16, overflow: 'hidden', background: '#000', boxShadow: '0 8px 40px rgba(0,0,0,0.25)' }}>
          <iframe
            ref={playerRef}
            src={`https://www.youtube-nocookie.com/embed/${videoData?.videoId}?rel=0&modestbranding=1&disablekb=0`}
            title={currentVideo?.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          />
          {/* Dynamic watermark overlay */}
          <div
            style={{
              position: 'absolute',
              top: wmPos.top,
              left: wmPos.left,
              color: 'rgba(255,255,255,0.25)',
              fontSize: '0.85rem',
              fontWeight: 600,
              pointerEvents: 'none',
              transition: 'top 2s ease, left 2s ease',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '0.02em',
              zIndex: 10,
              maxWidth: 200,
            }}
          >
            {videoData?.watermark}
          </div>
        </div>

        {/* Transparent overlay to prevent right-click on video */}
        <div
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 5 }}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>

      {/* Controls below player */}
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827', marginBottom: 6 }}>{currentVideo?.title}</h2>
          {currentVideo?.description && (
            <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.6 }}>{currentVideo.description}</p>
          )}
          <div style={{ marginTop: 10, padding: '6px 12px', background: '#fef3c7', borderRadius: 6, display: 'inline-block', fontSize: '0.75rem', color: '#92400e' }}>
            ⚠️ Recording or sharing this content is prohibited. Your email is watermarked on the video.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
          {!completed ? (
            <Button variant="success" onClick={markComplete}>✓ Mark as Complete</Button>
          ) : (
            <div style={{ padding: '10px 18px', background: '#d1fae5', color: '#065f46', borderRadius: 8, fontWeight: 600, fontSize: '0.875rem' }}>✅ Completed</div>
          )}
        </div>
      </div>

      {/* Prev / Next navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        {prevVideo ? (
          <Button variant="secondary" onClick={() => navigate(`/student/courses/${courseId}/videos/${prevVideo.id}`)}>
            ← {prevVideo.title.slice(0, 30)}
          </Button>
        ) : <div />}
        {nextVideo ? (
          <Button onClick={() => navigate(`/student/courses/${courseId}/videos/${nextVideo.id}`)}>
            {nextVideo.title.slice(0, 30)} →
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => navigate(`/student/courses/${courseId}`)}>← Back to Course</Button>
        )}
      </div>
    </Layout>
  );
}
