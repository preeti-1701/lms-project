import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import ReadMoreText from './components/ReadMoreText';

function StudentDashboard() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const [showProfile, setShowProfile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [view, setView] = useState('dashboard');
  const [courses, setCourses] = useState([]);
  const [summary, setSummary] = useState({
    courses: 0,
    completed: 0,
    total_videos: 0,
    progress: 0,
  });

  const initials = (
    currentUser?.first_name?.[0] ||
    currentUser?.username?.[0] ||
    'U'
  ).toUpperCase();

  const handleLogout = async () => {
    try {
      await api.post('/api/logout/');
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('session_token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('/api/student-courses/');
      setCourses(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get('/api/student-stats/');
      setSummary(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchSummary();

    const interval = setInterval(() => {
      fetchCourses();
      fetchSummary();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const markComplete = async (videoId) => {
    try {
      await api.post('/api/mark-complete/', { video_id: videoId });
      alert('Video marked completed');
      fetchCourses();
      fetchSummary();
    } catch (error) {
      console.error(error);
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';

    let videoId = '';

    if (url.includes('youtu.be')) {
      videoId = url.split('/').pop();
    } else if (url.includes('watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    }

    if (!videoId) return url;

    // Return a watch URL (opens YouTube page) instead of embed
    return `https://www.youtube.com/watch?v=${videoId}`;
  };

  const navItems = [
    { label: 'Dashboard', icon: '▣', action: () => setView('dashboard') },
    { label: 'My Courses', icon: '📚', action: () => setView('courses') },
    { label: 'Progress', icon: '📈', action: () => setView('progress') },
    { label: 'Profile', icon: '👤', action: () => setShowProfile(!showProfile) },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(34,211,238,0.12),_transparent_28%),linear-gradient(180deg,_#0f172a_0%,_#020617_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-[-8rem] h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="relative flex min-h-screen flex-col lg:flex-row">
        <aside
          className={`border-r border-white/10 bg-slate-900/80 backdrop-blur-xl transition-all duration-300 ${
            collapsed ? 'w-full lg:w-24' : 'w-full lg:w-80'
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 lg:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-lg font-bold text-white shadow-lg shadow-cyan-500/20">
                S
              </div>
              {!collapsed && (
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Student</p>
                  <h1 className="text-xl font-semibold text-white">Learning Studio</h1>
                </div>
              )}
            </div>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:border-cyan-400/50 hover:bg-cyan-400/10"
            >
              {collapsed ? '›' : '‹'}
            </button>
          </div>

          <div className="px-4 py-5 lg:px-5">
            <nav className="space-y-3.5">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition duration-200 hover:-translate-y-0.5 hover:bg-white/8 hover:shadow-lg hover:shadow-cyan-950/20 ${
                    view === item.label.toLowerCase().replace(/\s+/g, '')
                      ? 'bg-cyan-400/15 ring-1 ring-cyan-300/25'
                      : 'bg-white/5'
                  }`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-sm text-cyan-200">
                    {item.icon}
                  </span>
                  {!collapsed && <span className="flex-1 text-sm font-medium text-slate-100">{item.label}</span>}
                </button>
              ))}

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-2xl bg-rose-500 px-4 py-3 text-left text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-rose-400"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-sm">🚪</span>
                {!collapsed && <span className="flex-1">Logout</span>}
              </button>
            </nav>

            <div className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/15 to-fuchsia-500/15 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Profile</p>
              {!collapsed && (
                <>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold text-white">
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {currentUser?.first_name || currentUser?.username || 'Student'}
                      </p>
                      <p className="text-sm text-slate-300">{currentUser?.email || 'Learner account'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowProfile(!showProfile)}
                    className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    {showProfile ? 'Hide profile' : 'Show profile'}
                  </button>
                </>
              )}
            </div>
          </div>
        </aside>

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl">
            <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-8">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.22),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.14),transparent_28%)]" />
              <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                <div className="max-w-3xl">
                  <p className="inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
                    Student workspace
                  </p>
                  <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                    Student Dashboard
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                    Track progress, watch assigned videos, and jump back into your courses with a polished interface built for focus.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[360px] xl:grid-cols-1">
                  <button
                    onClick={() => setView('courses')}
                    className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-cyan-50"
                  >
                    My courses
                  </button>
                  <button
                    onClick={() => setView('progress')}
                    className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                  >
                    View progress
                  </button>
                </div>
              </div>
            </header>

            <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Courses"
                value={summary.courses}
                hint="Assigned to your account"
                icon="📚"
                accent="from-cyan-400 to-blue-500"
              />
              <StatCard
                title="Completed"
                value={`${summary.completed}/${summary.total_videos}`}
                hint="Lessons completed"
                icon="✅"
                accent="from-emerald-400 to-teal-500"
              />
              <StatCard
                title="Progress"
                value={`${summary.progress}%`}
                hint="Current learning momentum"
                icon="📈"
                accent="from-fuchsia-400 to-pink-500"
              />
              <StatCard
                title="Time Spent"
                value="--"
                hint="Tracking coming soon"
                icon="⏱️"
                accent="from-amber-400 to-orange-500"
              />
            </section>

            {showProfile && (
              <section className="mt-6 rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Profile</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">{currentUser?.username || 'Student account'}</h3>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="rounded-2xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-400"
                  >
                    Logout
                  </button>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-3xl font-bold text-white shadow-lg shadow-cyan-500/20">
                      {initials}
                    </div>
                    <p className="mt-4 text-lg font-semibold text-white">
                      {currentUser?.first_name || currentUser?.username || 'Student'} {currentUser?.last_name || ''}
                    </p>
                    <p className="mt-1 text-sm text-slate-300">Student dashboard</p>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                    <div className="grid gap-3 text-sm text-slate-300">
                      <InfoRow label="Username" value={currentUser?.username || '—'} />
                      <InfoRow label="Role" value={currentUser?.role || 'student'} />
                      <InfoRow label="Courses" value={summary.courses} />
                      <InfoRow label="Progress" value={`${summary.progress}%`} />
                    </div>
                  </div>
                </div>
              </section>
            )}

            <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">My courses</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    {view === 'progress' ? 'Learning progress overview' : 'Course library'}
                  </h3>
                </div>
                <button
                  onClick={() => setView(view === 'courses' ? 'dashboard' : 'courses')}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Switch view
                </button>
              </div>

              {courses.length === 0 ? (
                <div className="mt-6 rounded-[1.5rem] border border-dashed border-white/15 bg-slate-950/40 p-10 text-center">
                  <p className="text-lg font-semibold text-white">No courses assigned yet</p>
                  <p className="mt-2 text-sm text-slate-400">Your trainer will assign courses here when they are ready.</p>
                </div>
              ) : (
                <div className="mt-6 space-y-8">
                  {courses.map((course) => (
                    <article
                      key={course.id || course.course}
                      className="rounded-[1.75rem] border border-white/10 bg-slate-950/45 p-6 shadow-lg shadow-slate-950/20 transition hover:-translate-y-1 hover:border-cyan-300/20"
                    >
                      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">Course</p>
                          <h4 className="mt-2 text-2xl font-semibold text-white">{course.course}</h4>
                          <ReadMoreText
                            text={course.description}
                            className="mt-2 max-w-3xl text-sm leading-6 text-slate-300"
                          />
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                          <div className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-4xl font-bold text-transparent">
                            {course.progress}%
                          </div>
                          <p className="text-sm text-slate-400">Progress</p>
                        </div>
                      </div>

                      <div className="grid gap-4 border-b border-white/10 pb-6 md:grid-cols-3">
                        <Meta label="Category" value={course.category} />
                        <Meta label="Level" value={course.level} />
                        <Meta label="Duration" value={course.duration} />
                      </div>

                      <div className="mb-8 mt-6">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid gap-6 lg:grid-cols-3">
                        {course.videos?.length > 0 ? (
                          course.videos.map((video) => (
                            <VideoCard
                              key={video.id}
                              video={video}
                              username={currentUser?.username}
                              onMarkComplete={() => markComplete(video.id)}
                              getEmbedUrl={getEmbedUrl}
                            />
                          ))
                        ) : (
                          <div className="col-span-full rounded-2xl border border-dashed border-white/15 bg-white/5 py-8 text-center text-slate-400">
                            No videos available
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value, hint, icon, accent }) {
  return (
    <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/8 p-6 shadow-xl shadow-slate-950/20 backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/20">
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-10 transition group-hover:opacity-20`} />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-300">{title}</p>
          <div className="mt-3 text-4xl font-bold tracking-tight text-white">{value}</div>
          <p className="mt-2 text-sm text-slate-400">{hint}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">{icon}</div>
      </div>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className="mt-2 font-semibold text-white">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-950/45 px-4 py-3">
      <span>{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

function VideoCard({ video, username, onMarkComplete, getEmbedUrl }) {
  return (
    <div className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900/70 shadow-lg shadow-slate-950/20 transition hover:-translate-y-1 hover:border-cyan-300/20">
        <div className="relative aspect-video bg-black flex items-center justify-center">
          <div className="absolute left-3 top-3 z-10 rounded-lg bg-slate-950/80 px-3 py-1 text-xs text-white">
            {username}
          </div>

          <div className="flex flex-col items-center gap-4">
            {(() => {
              let videoId = '';
              const url = video.link || '';
              if (url.includes('youtu.be')) {
                videoId = url.split('/').pop();
              } else if (url.includes('watch?v=')) {
                videoId = url.split('v=')[1].split('&')[0];
              }

              if (videoId) {
                return (
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                    alt={video.title}
                    className="w-80 rounded-lg shadow-lg"
                  />
                );
              }

              return (
                <div className="w-80 h-44 rounded-lg bg-gray-800 flex items-center justify-center text-sm text-slate-300">
                  No preview available
                </div>
              );
            })()}

            <a
              href={getEmbedUrl(video.link)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 py-2 px-4 font-semibold text-white hover:opacity-90"
            >
              Watch on YouTube
            </a>
          </div>
        </div>

      <div className="p-5">
        <h4 className="mb-2 text-lg font-semibold text-white">{video.title}</h4>
        <ReadMoreText
          text={video.description}
          className="mb-4 text-sm leading-6 text-slate-300"
        />

        <div className="mb-4">
          <span className={video.completed ? 'text-emerald-300' : 'text-amber-300'}>
            {video.completed ? '✅ Completed' : '⏳ Not Completed'}
          </span>
        </div>

        {!video.completed && (
          <button
            onClick={onMarkComplete}
            className="w-full rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 py-2 font-semibold text-white transition hover:from-cyan-300 hover:to-blue-500"
          >
            Mark Completed
          </button>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;