import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

function TrainerDashboard() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [view, setView] = useState('dashboard');
  const [stats, setStats] = useState({ courses: 0, videos: 0 });
  const [trainerCourses, setTrainerCourses] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const initials = (
    currentUser?.first_name?.[0] ||
    currentUser?.username?.[0] ||
    'T'
  ).toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/trainer-stats/');
      setStats(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTrainerCourses = async () => {
    try {
      const res = await api.get('/api/trainer-courses/');
      setTrainerCourses(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTrainerCourses();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(236,72,153,0.16),_transparent_28%),linear-gradient(180deg,_#0f172a_0%,_#020617_100%)]" />
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
                T
              </div>
              {!collapsed && (
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Trainer</p>
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
              <SideButton
                icon="▣"
                label="Dashboard"
                collapsed={collapsed}
                active={view === 'dashboard'}
                onClick={() => setView('dashboard')}
              />
              <SideButton
                icon="＋"
                label="Create Course"
                collapsed={collapsed}
                onClick={() => navigate('/create-course')}
              />
              <SideButton
                icon="▶"
                label="Add Videos"
                collapsed={collapsed}
                onClick={() => navigate('/add-video')}
              />
              <SideButton
                icon="📖"
                label="My Catalog"
                collapsed={collapsed}
                active={view === 'catalog'}
                onClick={() => setView('catalog')}
              />
              <SideButton
                icon="👤"
                label="Profile"
                collapsed={collapsed}
                active={showProfile}
                onClick={() => setShowProfile(!showProfile)}
              />
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
                        {currentUser?.first_name || currentUser?.username || 'Trainer'}
                      </p>
                      <p className="text-sm text-slate-300">{currentUser?.email || 'Learning content manager'}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="mt-4 w-full rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </aside>

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl">
            <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-8">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.22),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.18),transparent_28%)]" />
              <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                <div className="max-w-3xl">
                  <p className="inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
                    Trainer workspace
                  </p>
                  <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                    Trainer Dashboard
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                    Manage your courses, upload videos, and track your training content all in one place.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row xl:min-w-[320px] xl:flex-col">
                  <button
                    onClick={() => navigate('/create-course')}
                    className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-cyan-50"
                  >
                    Create course
                  </button>
                  <button
                    onClick={() => navigate('/add-video')}
                    className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                  >
                    Upload videos
                  </button>
                </div>
              </div>
            </header>

            <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <StatCard title="Courses" value={stats.courses} hint="Active courses in your workspace" icon="📚" accent="from-cyan-400 to-blue-500" />
              <StatCard title="Videos" value={stats.videos} hint="Uploaded learning assets" icon="🎬" accent="from-fuchsia-400 to-pink-500" />
              <StatCard title="Profile" value={currentUser?.username || 'Trainer'} hint="Account identity" icon="👤" accent="from-emerald-400 to-teal-500" />
              <StatCard title="Status" value="Online" hint="Dashboard ready" icon="✨" accent="from-amber-400 to-orange-500" />
            </section>

            <section className="mt-6 grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Quick actions</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Move faster between your key tasks</h3>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <ActionCard
                    label="Create a polished course"
                    description="Start a new learning path with a structured content flow."
                    buttonLabel="Create course"
                    onClick={() => navigate('/create-course')}
                    accent="from-cyan-400/20 to-blue-500/20"
                  />
                  <ActionCard
                    label="Upload new videos"
                    description="Add lessons and media assets to keep your catalog current."
                    buttonLabel="Add videos"
                    onClick={() => navigate('/add-video')}
                    accent="from-fuchsia-400/20 to-pink-500/20"
                  />
                  <ActionCard
                    label="Review your catalog"
                    description="Check progress, edit courses, and keep your content organized."
                    buttonLabel="Open catalog"
                    onClick={() => setView('catalog')}
                    accent="from-emerald-400/20 to-teal-500/20"
                  />
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Profile</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">{currentUser?.username || 'Trainer account'}</h3>
                  </div>
                  <button
                    onClick={() => setShowProfile(!showProfile)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    {showProfile ? 'Hide' : 'Show'}
                  </button>
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-lg font-bold text-white shadow-lg shadow-cyan-500/20">
                      {initials}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {currentUser?.first_name || currentUser?.username || 'Trainer'} {currentUser?.last_name || ''}
                      </p>
                      <p className="text-sm text-slate-300">Trainer dashboard</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm text-slate-300">
                    <InfoRow label="Username" value={currentUser?.username || '—'} />
                    <InfoRow label="Courses" value={stats.courses} />
                    <InfoRow label="Videos" value={stats.videos} />
                  </div>

                  <button
                    onClick={handleLogout}
                    className="mt-5 w-full rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
                  >
                    Logout
                  </button>
                </div>

                {showProfile && (
                  <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Account details</p>
                    <div className="mt-4 space-y-3 text-sm text-slate-300">
                      <InfoRow label="Email" value={currentUser?.email || 'Not set'} />
                      <InfoRow label="Role" value="Trainer" />
                      <InfoRow label="Catalog items" value={String(trainerCourses.length)} />
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Catalog</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    {view === 'dashboard' ? 'Featured workspace snapshot' : 'My course catalog'}
                  </h3>
                </div>
                <button
                  onClick={() => setView(view === 'dashboard' ? 'catalog' : 'dashboard')}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Switch view
                </button>
              </div>

              {view === 'dashboard' ? (
                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <MiniFeature title="Structured publishing" text="Keep lessons organized with a layout that feels lighter and faster." />
                  <MiniFeature title="Fast course editing" text="Jump back into a course and revise details without losing momentum." />
                  <MiniFeature title="Content overview" text="See the current shape of your training library at a glance." />
                </div>
              ) : (
                <div className="mt-6">
                  {trainerCourses.length === 0 ? (
                    <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-slate-950/40 p-10 text-center">
                      <p className="text-lg font-semibold text-white">No courses created yet</p>
                      <p className="mt-2 text-sm text-slate-400">Create your first course to populate this catalog.</p>
                      <button
                        onClick={() => navigate('/create-course')}
                        className="mt-5 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                      >
                        Create course
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                      {trainerCourses.map((course) => (
                        <div
                          key={course.id}
                          className="group rounded-[1.75rem] border border-white/10 bg-slate-950/45 p-5 shadow-lg shadow-slate-950/20 transition hover:-translate-y-1 hover:border-cyan-300/20"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">Course</p>
                              <h4 className="mt-2 text-xl font-semibold text-white">{course.title}</h4>
                            </div>
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                              {course.level || 'All levels'}
                            </span>
                          </div>

                          <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-300">
                            {course.description || 'No description available.'}
                          </p>

                          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                            <MetaPill label="Category" value={course.category || 'General'} />
                            <MetaPill label="Duration" value={course.duration || '—'} />
                            <MetaPill label="Videos" value={course.videos_count ?? 0} />
                            <MetaPill label="Status" value={course.is_archived ? 'Archived' : 'Live'} />
                          </div>

                          <div className="mt-5 flex flex-wrap gap-3">
                            <button
                              onClick={() => navigate('/add-video')}
                              className="rounded-2xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                            >
                              Add video
                            </button>
                            <button
                              onClick={() => navigate('/create-course', { state: { editMode: true, course } })}
                              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                              Edit course
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function SideButton({ icon, label, collapsed, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition duration-200 hover:-translate-y-0.5 hover:bg-white/8 hover:shadow-lg hover:shadow-cyan-950/20 ${
        active ? 'bg-cyan-400/15 ring-1 ring-cyan-300/25' : 'bg-white/5'
      }`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-sm text-cyan-200">
        {icon}
      </span>
      {!collapsed && <span className="flex-1 text-sm font-medium text-slate-100">{label}</span>}
    </button>
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

function ActionCard({ label, description, buttonLabel, onClick, accent }) {
  return (
    <div className={`rounded-[1.75rem] border border-white/10 bg-gradient-to-br ${accent} p-5 shadow-lg shadow-slate-950/20 transition hover:-translate-y-1`}>
      <h4 className="text-lg font-semibold text-white">{label}</h4>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
      <button
        onClick={onClick}
        className="mt-5 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function MetaPill({ label, value }) {
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

function MiniFeature({ title, text }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5">
      <div className="mb-4 h-2 w-16 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400" />
      <h4 className="text-lg font-semibold text-white">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
    </div>
  );
}

export default TrainerDashboard;