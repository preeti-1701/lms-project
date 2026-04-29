import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

function AdminDashboard() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    videos: 0,
    enrollments: 0,
  });

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const initials = (
    currentUser?.first_name?.[0] ||
    currentUser?.username?.[0] ||
    'A'
  ).toUpperCase();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/admin-stats/');
        setStats(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const navItems = [
    { label: 'Create User', icon: '👤', action: () => navigate('/create-user') },
    { label: 'Create Course', icon: '📚', action: () => navigate('/create-course') },
    { label: 'Manage Courses', icon: '🗂', action: () => navigate('/manage-courses') },
    { label: 'Add Videos', icon: '🎥', action: () => navigate('/add-video') },
    { label: 'Enroll Students', icon: '🎓', action: () => navigate('/enroll') },
  ];

  const statCards = [
    { title: 'Users', value: stats.users, hint: 'Active platform accounts', icon: '👥', accent: 'from-cyan-400 to-blue-500' },
    { title: 'Courses', value: stats.courses, hint: 'Learning paths created', icon: '📚', accent: 'from-fuchsia-400 to-pink-500' },
    { title: 'Videos', value: stats.videos, hint: 'Uploaded course videos', icon: '🎬', accent: 'from-emerald-400 to-teal-500' },
    { title: 'Enrollments', value: stats.enrollments, hint: 'Assigned student seats', icon: '🎓', accent: 'from-amber-400 to-orange-500' },
  ];

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
                A
              </div>
              {!collapsed && (
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Admin</p>
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
                  className="group flex w-full items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 text-left transition duration-200 hover:-translate-y-0.5 hover:bg-white/8 hover:shadow-lg hover:shadow-cyan-950/20"
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
                        {currentUser?.first_name || currentUser?.username || 'Admin'}
                      </p>
                      <p className="text-sm text-slate-300">{currentUser?.email || 'Platform manager'}</p>
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
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.22),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.14),transparent_28%)]" />
              <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                <div className="max-w-3xl">
                  <p className="inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
                    Admin workspace
                  </p>
                  <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                    Admin Dashboard
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                    Manage users, courses, videos, and enrollments from one polished control panel.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[360px] xl:grid-cols-1">
                  <button
                    onClick={() => navigate('/create-user')}
                    className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-cyan-50"
                  >
                    Create user
                  </button>
                  <button
                    onClick={() => navigate('/manage-courses')}
                    className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                  >
                    Manage courses
                  </button>
                </div>
              </div>
            </header>

            <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => (
                <StatCard key={card.title} {...card} />
              ))}
            </section>

            <section className="mt-6 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
              <div className="rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Quick actions</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Core admin workflows</h3>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <ActionCard
                    label="Create a new user"
                    description="Register trainers, students, or staff in seconds."
                    buttonLabel="Open"
                    onClick={() => navigate('/create-user')}
                    accent="from-cyan-400/20 to-blue-500/20"
                  />
                  <ActionCard
                    label="Build or edit a course"
                    description="Launch structured course content with a modern editor flow."
                    buttonLabel="Open"
                    onClick={() => navigate('/create-course')}
                    accent="from-fuchsia-400/20 to-pink-500/20"
                  />
                  <ActionCard
                    label="Manage enrollments"
                    description="Assign students to the correct courses and keep records clean."
                    buttonLabel="Open"
                    onClick={() => navigate('/enroll')}
                    accent="from-emerald-400/20 to-teal-500/20"
                  />
                  <ActionCard
                    label="Review courses"
                    description="Audit, update, and organize existing courses in one place."
                    buttonLabel="Open"
                    onClick={() => navigate('/manage-courses')}
                    accent="from-amber-400/20 to-orange-500/20"
                  />
                  <ActionCard
                    label="Add videos"
                    description="Upload video lessons to keep your catalog fresh."
                    buttonLabel="Open"
                    onClick={() => navigate('/add-video')}
                    accent="from-cyan-400/20 to-sky-500/20"
                  />
                  <ActionCard
                    label="Logout"
                    description="End the current admin session securely."
                    buttonLabel="Logout"
                    onClick={handleLogout}
                    accent="from-rose-400/20 to-red-500/20"
                  />
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Profile</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">{currentUser?.username || 'Admin account'}</h3>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-lg font-bold text-white shadow-lg shadow-cyan-500/20">
                      {initials}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {currentUser?.first_name || currentUser?.username || 'Admin'} {currentUser?.last_name || ''}
                      </p>
                      <p className="text-sm text-slate-300">Platform administrator</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm text-slate-300">
                    <InfoRow label="Username" value={currentUser?.username || '—'} />
                    <InfoRow label="Role" value={currentUser?.role || 'admin'} />
                    <InfoRow label="Users" value={stats.users} />
                    <InfoRow label="Enrollments" value={stats.enrollments} />
                  </div>
                </div>

                <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Workspace summary</p>
                  <div className="mt-4 space-y-3 text-sm text-slate-300">
                    <InfoRow label="Courses" value={stats.courses} />
                    <InfoRow label="Videos" value={stats.videos} />
                    <InfoRow label="Status" value="All systems ready" />
                  </div>
                </div>
              </div>
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
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">
          {icon}
        </div>
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

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-950/45 px-4 py-3">
      <span>{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

export default AdminDashboard;