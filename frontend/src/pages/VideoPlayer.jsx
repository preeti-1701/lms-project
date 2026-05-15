import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getYoutubeEmbedUrl } from '../utils/videoUtils';

// ── Stable watermark grid positions (computed once, not on every render) ───────
const WATERMARK_POSITIONS = [
  { top: '8%',  left: '5%'  }, { top: '8%',  left: '40%' }, { top: '8%',  left: '75%' },
  { top: '28%', left: '15%' }, { top: '28%', left: '55%' }, { top: '28%', left: '85%' },
  { top: '48%', left: '2%'  }, { top: '48%', left: '35%' }, { top: '48%', left: '68%' },
  { top: '68%', left: '20%' }, { top: '68%', left: '60%' }, { top: '68%', left: '90%' },
  { top: '88%', left: '8%'  }, { top: '88%', left: '45%' }, { top: '88%', left: '78%' },
];

const VideoPlayer = () => {
  const { courseId, videoId } = useParams();
  const [video,     setVideo]     = useState(null);
  const [allVideos, setAllVideos] = useState([]);
  const [progress,  setProgress]  = useState([]);
  const [course,    setCourse]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [wmTime,    setWmTime]    = useState('');   // dynamic watermark timestamp
  const { user } = useAuth();
  const navigate  = useNavigate();

  // ── Update watermark timestamp every 30 s ──────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setWmTime(now.toLocaleString('en-IN', { hour12: false }));
    };
    tick();
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, []);

  // ── Block right-click inside the video area ────────────────────────────────
  const playerRef = useRef(null);
  useEffect(() => {
    const el = playerRef.current;
    if (!el) return;
    const prevent = (e) => e.preventDefault();
    el.addEventListener('contextmenu', prevent);
    return () => el.removeEventListener('contextmenu', prevent);
  }, []);

  // ── Fetch video + course data ──────────────────────────────────────────────
  const fetchVideoData = useCallback(async () => {
    setLoading(true);
    try {
      const [courseRes, videosRes, progressRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/courses/${courseId}/videos`),
        api.get(`/videos/course/${courseId}/progress`),
      ]);
      setCourse(courseRes.data);
      setAllVideos(videosRes.data);
      setProgress(progressRes.data);
      const currentVideo = videosRes.data.find(v => v.id.toString() === videoId);
      if (!currentVideo) setError('Video not found in this course.');
      else setVideo(currentVideo);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load video.');
    } finally {
      setLoading(false);
    }
  }, [courseId, videoId]);

  useEffect(() => { fetchVideoData(); }, [fetchVideoData]);

  // ── Toggle progress ────────────────────────────────────────────────────────
  const toggleProgress = async (vidId, currentStatus) => {
    try {
      await api.post(`/videos/${vidId}/toggle-progress`, { completed: !currentStatus });
      const res = await api.get(`/videos/course/${courseId}/progress`);
      setProgress(res.data);
    } catch (err) {
      console.error('Failed to update progress', err);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (error)  return <div className="text-center py-10 text-red-500 bg-gray-900 min-h-screen flex items-center justify-center">{error}</div>;
  if (!video) return <div className="text-center py-10 text-white bg-gray-900 min-h-screen flex items-center justify-center">Video not found.</div>;

  const isCompleted    = progress.find(p => p.video_id === video.id)?.completed || false;
  const currentIndex   = allVideos.findIndex(v => v.id.toString() === videoId);
  const watermarkLabel = user ? `${user.email} • ID:${user.id}` : '';

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-950 overflow-hidden">

      {/* ── Main Video Section ──────────────────────────────────────────── */}
      <div className="flex-grow flex flex-col h-full overflow-y-auto">

        {/* Header */}
        <div className="p-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
          <Link
            to={`/course/${courseId}`}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <div className="p-2 rounded-lg group-hover:bg-gray-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Back to Course</p>
              <h3 className="text-sm font-bold truncate max-w-[200px]">{course?.title}</h3>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleProgress(video.id, isCompleted)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
              }`}
            >
              {isCompleted ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Completed
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  Mark as Complete
                </>
              )}
            </button>
            <span className="hidden sm:inline-block px-3 py-1 bg-blue-600/10 text-blue-400 rounded-full text-xs font-bold border border-blue-500/20">
              🔒 SECURE STREAM
            </span>
          </div>
        </div>

        {/* ── Player Area with Dynamic Watermark ──────────────────────── */}
        <div
          ref={playerRef}
          className="relative flex-grow bg-black flex items-center justify-center"
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="w-full max-w-6xl aspect-video relative shadow-2xl">

            {/* YouTube iframe — no download controls */}
            <iframe
              src={`${getYoutubeEmbedUrl(video.youtube_url)}?rel=0&modestbranding=1&autoplay=1&disablekb=0&fs=0&iv_load_policy=3`}
              title={video.title}
              className="absolute top-0 left-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen={false}
            />

            {/* ── Dynamic Animated Watermark Overlay ────────────────── */}
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden select-none z-10"
              style={{ userSelect: 'none' }}
            >
              {WATERMARK_POSITIONS.map((pos, i) => (
                <div
                  key={i}
                  className="absolute text-[11px] font-semibold whitespace-nowrap"
                  style={{
                    top:       pos.top,
                    left:      pos.left,
                    color:     'rgba(255,255,255,0.12)',
                    transform: 'rotate(-25deg)',
                    animation: `wmDrift ${8 + (i % 5)}s ease-in-out infinite alternate`,
                    animationDelay: `${(i * 0.7) % 4}s`,
                    textShadow: '0 0 4px rgba(0,0,0,0.5)',
                    letterSpacing: '0.04em',
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                >
                  {watermarkLabel} • {wmTime}
                </div>
              ))}
            </div>

            {/* CSS for watermark drift animation */}
            <style>{`
              @keyframes wmDrift {
                0%   { opacity: 0.08; transform: rotate(-25deg) translateY(0px); }
                50%  { opacity: 0.15; }
                100% { opacity: 0.08; transform: rotate(-25deg) translateY(6px); }
              }
            `}</style>
          </div>
        </div>

        {/* Video Info */}
        <div className="p-8 bg-gray-900 border-t border-gray-800 text-white">
          <div className="max-w-4xl">
            <h1 className="text-2xl font-extrabold mb-3">{video.title}</h1>
            <div className="flex flex-wrap gap-4 items-center text-sm text-gray-400 mb-6">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Lesson {currentIndex + 1} of {allVideos.length}
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Instructor: {course?.created_by_name || 'Admin'}
              </div>
            </div>

            {/* Copyright Warning */}
            <div className="p-5 bg-red-950/20 border border-red-500/20 rounded-2xl">
              <div className="flex gap-4">
                <div className="p-3 bg-red-500/20 rounded-xl text-red-500 h-fit flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-red-400 font-bold mb-1 text-sm">Copyright Protection Active</h4>
                    <p className="text-red-400/70 text-xs leading-relaxed">
                      This content is protected by the following security pillars: 
                      <strong> Bcrypt Password Hashing</strong>, 
                      <strong> HTTPS Encryption</strong>, 
                      <strong> Dynamic User Watermarking</strong>, and 
                      <strong> Deterrent-based Screenshot Blocking</strong>. 
                      Please note that while we implement robust protections, content protection is limited by browser constraints. 
                      Sharing this content will result in immediate account termination.
                    </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Side Playlist ────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-96 h-full bg-gray-900 border-l border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              Playlist
              <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded-md">
                {allVideos.length}
              </span>
            </span>
            <span className="text-xs font-medium text-emerald-400">
              {progress.filter(p => p.completed).length}/{allVideos.length} Done
            </span>
          </h2>
        </div>

        <div className="flex-grow overflow-y-auto playlist-scroll">
          {allVideos.map((v, index) => {
            const isActive         = v.id.toString() === videoId;
            const videoIsCompleted = progress.find(p => p.video_id === v.id)?.completed || false;
            return (
              <Link
                key={v.id}
                to={`/course/${courseId}/video/${v.id}`}
                className={`flex gap-4 p-4 transition-all hover:bg-gray-800 border-b border-gray-800/50 ${
                  isActive ? 'bg-blue-600/10 border-l-4 border-l-blue-600' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-bold transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : videoIsCompleted
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : 'bg-gray-800 text-gray-500'
                }`}>
                  {videoIsCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : index + 1}
                </div>
                <div className="overflow-hidden">
                  <p className={`text-sm font-semibold truncate ${isActive ? 'text-blue-400' : 'text-gray-300'}`}>
                    {v.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {videoIsCompleted ? '✅ Completed' : 'Video Lesson'}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        .playlist-scroll::-webkit-scrollbar { width: 4px; }
        .playlist-scroll::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
        .playlist-scroll::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
