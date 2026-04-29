import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

function AddVideo() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/admin');
  };

  // 🔹 Fetch courses for dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/api/courses/');   // ✅ correct
        setCourses(res.data);
        setFeedback({ type: '', text: '' });
      } catch (err) {
        console.error(err);
        setFeedback({
          type: 'error',
          text: 'Unable to load courses right now.'
        });
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  // 🔹 Add video
  const handleAddVideo = async (e) => {
    e.preventDefault();

    // ✅ Basic validation
    if (!courseId || !title.trim() || !youtubeLink.trim()) {
      setFeedback({
        type: 'error',
        text: 'Please fill all required fields.'
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: '', text: '' });

    try {
      await api.post('/api/add-video/', {
        course_id: courseId,
        title,
        description,
        youtube_link: youtubeLink
      });

      setFeedback({
        type: 'success',
        text: 'Video added successfully.'
      });

      // 🔄 Reset form
      setCourseId('');
      setTitle('');
      setDescription('');
      setYoutubeLink('');

    } catch (error) {
      console.error(error.response);
      setFeedback({
        type: 'error',
        text: error?.response?.data?.message || 'Error adding video.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen bg-slate-950 relative overflow-hidden px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent opacity-30 pointer-events-none" />

      <div className="relative z-10 mx-auto mb-6 flex w-full max-w-6xl items-center justify-between px-1">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/40 px-4 py-2 text-sm font-semibold text-slate-300 backdrop-blur-xl transition hover:border-cyan-400/30 hover:text-cyan-400"
        >
          <span aria-hidden="true">←</span>
          Back
        </button>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_24px_60px_rgba(15,23,42,0.35)] lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="flex flex-col gap-5 bg-slate-900/40 px-7 py-9 text-white backdrop-blur-xl sm:px-9 sm:py-11 lg:px-10">
          <span className="w-fit rounded-full border border-cyan-400/30 bg-gradient-to-r from-cyan-400/20 to-blue-600/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300 backdrop-blur">
            video management
          </span>

          <div className="space-y-3">
            <h1 className="max-w-lg text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                Manage Video Lessons
              </span>
            </h1>
            <p className="max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
              Add and organize lesson videos in a clean workspace designed for faster course building.
            </p>
          </div>
        </aside>

        <form className="flex flex-col gap-5 bg-slate-900/40 px-6 py-8 backdrop-blur-xl sm:px-8 sm:py-10 lg:px-10" onSubmit={handleAddVideo}>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">Add New Video</h2>
            <p className="text-sm text-slate-400">
              Select a course and enter the lesson details below.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="course-id" className="text-sm font-semibold text-slate-300">Course</label>
            <select
              id="course-id"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-500/15 disabled:cursor-not-allowed disabled:bg-slate-900/30"
              disabled={isLoadingCourses}
            >
              <option value="">
                {isLoadingCourses ? 'Loading courses...' : 'Select Course'}
              </option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="video-title" className="text-sm font-semibold text-slate-300">Video Title</label>
            <input
              id="video-title"
              placeholder="Video Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-500/15"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="video-description" className="text-sm font-semibold text-slate-300">Description</label>
            <textarea
              id="video-description"
              placeholder="Video Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="min-h-[92px] w-full resize-y rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-500/15"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="youtube-link" className="text-sm font-semibold text-slate-300">YouTube Link</label>
            <input
              id="youtube-link"
              placeholder="YouTube Link"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-500/15"
            />
          </div>

          {feedback.text && (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm font-medium ${feedback.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                }`}
            >
              {feedback.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(34,211,238,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_36px_rgba(34,211,238,0.3)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isSubmitting ? 'Publishing Video...' : 'Publish Video'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default AddVideo;