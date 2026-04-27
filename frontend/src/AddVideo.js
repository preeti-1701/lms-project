// import React, { useState } from 'react';
// import axios from 'axios';

// function AddVideo() {
//   const [courseId, setCourseId] = useState('');
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [youtubeLink, setYoutubeLink] = useState('');

//   const handleAdd = async () => {
//     const token = localStorage.getItem('access_token');

//     try {
//       const response = await axios.post(
//         'http://127.0.0.1:8000/api/add-video/',
//         {
//           course_id: courseId,
//           title: title,
//           description: description,
//           youtube_link: youtubeLink
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         }
//       );

//       alert(response.data.message);
//     } catch (error) {
//       console.log(error.response);
//       alert("Error adding video");
//     }
//   };

//   return (
//     <div>
//       <h2>Add Video (YouTube)</h2>

//       <input placeholder="Course ID" onChange={(e) => setCourseId(e.target.value)} />
//       <input placeholder="Video Title" onChange={(e) => setTitle(e.target.value)} />
//       <textarea placeholder="Video Description" value={description} onChange={(e) => setDescription(e.target.value)}/>
//       <input placeholder="YouTube Link" onChange={(e) => setYoutubeLink(e.target.value)} />

//       <button onClick={handleAdd}>Add Video</button>
//     </div>
//   );
// }

// export default AddVideo;

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
    <section className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(255,184,77,0.16)_0%,transparent_28%),radial-gradient(circle_at_90%_18%,rgba(13,142,123,0.14)_0%,transparent_30%),linear-gradient(155deg,#f7fbfa_0%,#eef4ff_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto mb-4 flex w-full max-w-6xl items-center justify-between px-1">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
        >
          <span aria-hidden="true">←</span>
          Back
        </button>
      </div>

      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[28px] shadow-[0_24px_60px_rgba(15,23,42,0.12)] lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="flex flex-col gap-5 bg-[linear-gradient(160deg,#0f7f72,#0b6f88)] px-7 py-9 text-white sm:px-9 sm:py-11 lg:px-10">
          <span className="w-fit rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur">
            Trainer Workspace
          </span>

          <div className="space-y-3">
            <h1 className="max-w-lg text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              Manage Video Lessons
            </h1>
            <p className="max-w-lg text-sm leading-7 text-white/82 sm:text-base">
              Add and organize lesson videos in a clean workspace designed for faster course building.
            </p>
          </div>
        </aside>

        <form className="flex flex-col gap-3 bg-white px-6 py-7 sm:px-8 sm:py-9 lg:px-10" onSubmit={handleAddVideo}>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Add New Video</h2>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="course-id" className="text-sm font-semibold text-slate-700">Course</label>
            <select
              id="course-id"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 disabled:cursor-not-allowed disabled:bg-slate-50"
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
            <label htmlFor="video-title" className="text-sm font-semibold text-slate-700">Video Title</label>
            <input
              id="video-title"
              placeholder="Video Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="video-description" className="text-sm font-semibold text-slate-700">Description</label>
            <textarea
              id="video-description"
              placeholder="Video Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="min-h-[92px] w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="youtube-link" className="text-sm font-semibold text-slate-700">YouTube Link</label>
            <input
              id="youtube-link"
              placeholder="YouTube Link"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15"
            />
          </div>

          {feedback.text && (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm font-medium ${feedback.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
                }`}
            >
              {feedback.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
              className="mt-1 inline-flex items-center justify-center rounded-2xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(13,142,123,0.24)] transition hover:-translate-y-0.5 hover:bg-teal-800 hover:shadow-[0_20px_36px_rgba(13,142,123,0.3)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          >
              {isSubmitting ? 'Publishing Video...' : 'Publish Video'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default AddVideo;