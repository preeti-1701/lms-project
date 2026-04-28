import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

function StudentDashboard() {

  const navigate = useNavigate();

  const currentUser =
    JSON.parse(
      localStorage.getItem('user')
    );

  const [showProfile, setShowProfile] =
    useState(false);

  const [courses, setCourses] =
    useState([]);

  const [collapsed, setCollapsed] =
    useState(false);


  const [summary, setSummary] =
    useState({
      courses: 0,
      completed: 0,
      total_videos: 0,
      progress: 0
    });


  /* ------------------------
   Logout
  -------------------------*/
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };



  /* ------------------------
   Fetch Courses
  -------------------------*/
  const fetchCourses = async () => {

    try {

      const response =
        await api.get(
          '/api/student-courses/'
        );

      setCourses(
        response.data
      );

    } catch (error) {
      console.error(error);
    }

  };



  /* ------------------------
   Fetch Summary
  -------------------------*/
  const fetchSummary = async () => {

    try {

      const res =
        await api.get(
          '/api/student-stats/'
        );

      setSummary(
        res.data
      );

    } catch (error) {
      console.error(error);
    }

  };



  useEffect(() => {

    fetchCourses();
    fetchSummary();

  }, []);




  /* ------------------------
   Mark Complete
  -------------------------*/
  const markComplete = async (
    videoId
  ) => {

    try {

      await api.post(
        '/api/mark-complete/',
        {
          video_id: videoId
        }
      );

      alert(
        'Video marked completed'
      );

      fetchCourses();
      fetchSummary();

    } catch (error) {
      console.error(error);
    }

  };




  /* ------------------------
   Youtube Embed
  -------------------------*/
  const getEmbedUrl = (url) => {

    if (!url) return "";

    let videoId = "";

    if (
      url.includes(
        "youtu.be"
      )
    ) {
      videoId =
        url.split("/").pop();
    }

    else if (
      url.includes(
        "watch?v="
      )
    ) {
      videoId =
        url
          .split("v=")[1]
          .split("&")[0];
    }

    if (!videoId) {
      return url;
    }

    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&disablekb=1&controls=1`;

  };




  return (

    <div className="flex min-h-screen bg-slate-900">



      {/* SIDEBAR */}
      <div className={`${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 bg-gradient-to-b from-slate-800 to-slate-900 text-white p-6 border-r border-slate-700`}>

        <div className="flex justify-end mb-6">
          <button
            onClick={() =>
              setCollapsed(
                !collapsed
              )
            }
            className="p-2 hover:bg-slate-700 rounded-lg transition text-2xl"
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>


        {!collapsed && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Student Portal</h2>
            <div className="h-0.5 bg-gradient-to-r from-purple-400 to-pink-500 mt-2"></div>
          </div>
        )}

        <nav className="space-y-2">
          <SidebarButton icon="🏠" label="Dashboard" collapsed={collapsed} />
          <SidebarButton icon="📚" label="My Courses" collapsed={collapsed} />
          <SidebarButton icon="📈" label="Progress" collapsed={collapsed} />
          <SidebarButton icon="👤" label="Profile" onClick={() => setShowProfile(!showProfile)} collapsed={collapsed} />
          <SidebarButton icon="🚪" label="Logout" onClick={handleLogout} collapsed={collapsed} variant="danger" />
        </nav>

      </div>





      {/* MAIN */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(168,85,247,0.1)_0%,transparent_28%),radial-gradient(circle_at_90%_18%,rgba(236,72,153,0.08)_0%,transparent_30%),linear-gradient(155deg,#0f172a_0%,#1e293b_100%)]">

        {/* HEADER */}
        <div className="px-8 py-8 border-b border-slate-700 bg-slate-800/50 backdrop-blur">
          <h1 className="text-4xl font-bold text-white mb-2">My Courses</h1>
          <p className="text-slate-400">Continue learning and track your progress</p>
        </div>

        {/* CONTENT */}
        <div className="p-8">

          {/* TOP PROFILE SECTION */}
          <div className="flex justify-end mb-8 relative">

            <div className="flex items-center gap-4">
              {/* <div className="text-3xl">🔔</div> */}


              <div
                onClick={() =>
                  setShowProfile(
                    !showProfile
                  )
                }
                className="flex items-center gap-3 bg-slate-800 border border-slate-700 px-4 py-2 rounded-full cursor-pointer hover:border-slate-600 transition"
              >

                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                  {
                    (currentUser?.first_name?.[0]
                      ||
                      currentUser?.username?.[0]
                      ||
                      'U'
                    ).toUpperCase()
                  }
                </div>


                <div>

                  <div className="font-semibold text-white text-sm">
                    {currentUser?.username}
                  </div>

                  <div className="text-xs text-slate-400">
                    Student
                  </div>

                </div>

                <div className="text-slate-400">
                  ▼
                </div>

              </div>




            {showProfile && (

              <div className="absolute right-0 top-14 w-80 bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl z-50">

                <div className="text-center mb-6">

                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    {
                      (currentUser?.first_name?.[0]
                        ||
                        currentUser?.username?.[0]
                        ||
                        'U'
                      ).toUpperCase()
                    }
                  </div>


                  <h3 className="text-lg font-bold text-white">
                    {currentUser?.first_name
                      ||
                      currentUser?.username}
                    {' '}
                    {currentUser?.last_name || ''}
                  </h3>

                  <p className="text-slate-400 text-sm">
                    {currentUser?.role}
                  </p>

                </div>

                <div className="border-t border-slate-700 pt-4 space-y-3 text-sm">

                  <p className="text-slate-300">
                    <b className="text-white">Username:</b> {currentUser?.username}
                  </p>

                  <p className="text-slate-300">
                    <b className="text-white">Role:</b> {currentUser?.role}
                  </p>

                  <p className="text-slate-300">
                    <b className="text-white">Courses:</b> {summary.courses}
                  </p>

                  <p className="text-slate-300">
                    <b className="text-white">Progress:</b> {summary.progress}%
                  </p>

                </div>

                <button
                  onClick={handleLogout}
                  className="mt-6 w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition"
                >
                  Logout
                </button>

              </div>

            )}

          </div>

        </div>





        {/* SUMMARY STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <SummaryCard title="Total Courses" value={summary.courses} icon="📚" color="from-blue-500 to-blue-600" />
          <SummaryCard title="Completed Videos" value={`${summary.completed}/${summary.total_videos}`} icon="✅" color="from-green-500 to-green-600" />
          <SummaryCard title="Overall Progress" value={`${summary.progress}%`} icon="📈" color="from-purple-500 to-purple-600" />
          <SummaryCard title="Time Spent" value="--" icon="⏱️" color="from-orange-500 to-orange-600" />
        </div>




        {courses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No courses assigned yet</p>
          </div>
        )}



        {courses.map((c, index) => (

          <div
            key={index}
            className="mb-8 bg-slate-800/50 border border-slate-700 rounded-2xl p-8 backdrop-blur"
          >

            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {c.course}
                </h2>
                <p className="text-slate-400">{c.description}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{c.progress}%</div>
                <p className="text-slate-400 text-sm">Progress</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-slate-700">
              <CourseInfo label="Category" value={c.category} />
              <CourseInfo label="Level" value={c.level} />
              <CourseInfo label="Duration" value={c.duration} />
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-300">Course Progress</span>
                <span className="text-sm text-slate-400">{c.progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all" style={{ width: `${c.progress}%` }}></div>
              </div>
            </div>

            {/* Videos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">


              {c.videos && c.videos.length > 0 ? (

                c.videos.map((v, i) => (

                  <VideoCard
                    key={i}
                    video={v}
                    username={currentUser?.username}
                    onMarkComplete={() => markComplete(v.id)}
                    getEmbedUrl={getEmbedUrl}
                  />

                ))

              ) : (

                <div className="col-span-full text-center py-8">
                  <p className="text-slate-400">No videos available for this course</p>
                </div>

              )}

            </div>

          </div>

        ))}

        </div>

        </div>
      </div>

    </div>

  );

}


/* ==========================
   Sidebar Button Component
========================== */
function SidebarButton({ icon, label, onClick, collapsed, variant = 'default' }) {
  const variantClasses = {
    default: 'hover:bg-slate-700 hover:text-purple-400',
    danger: 'hover:bg-rose-600/20 hover:text-rose-400'
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white transition ${variantClasses[variant]}`}
    >
      <span className="text-xl">{icon}</span>
      {!collapsed && <span className="font-medium">{label}</span>}
    </button>
  );
}


/* ==========================
   Summary Card Component
========================== */
function SummaryCard({ title, value, icon, color }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition hover:shadow-xl hover:shadow-purple-500/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">{title}</h3>
        <span className="text-3xl">{icon}</span>
      </div>
      <div className={`text-3xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
        {value}
      </div>
    </div>
  );
}


/* ==========================
   Course Info Component
========================== */
function CourseInfo({ label, value }) {
  return (
    <div>
      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-white font-semibold text-sm">{value}</p>
    </div>
  );
}


/* ==========================
   Video Card Component
========================== */
function VideoCard({ video, username, onMarkComplete, getEmbedUrl }) {
  return (
    <div className="bg-slate-700/30 border border-slate-700 rounded-2xl overflow-hidden hover:border-slate-600 transition hover:shadow-lg group">

      {/* Video Container */}
      <div className="relative bg-black aspect-video overflow-hidden">
        <div className="absolute top-3 left-3 z-10 bg-slate-900/80 text-white px-3 py-1 rounded-lg text-xs font-semibold backdrop-blur">
          {username}
        </div>
        <iframe
          width="100%"
          height="100%"
          src={getEmbedUrl(video.link)}
          title={video.title}
          frameBorder="0"
          allow="encrypted-media"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="font-bold text-white mb-2 line-clamp-2">{video.title}</h4>
        <p className="text-slate-400 text-sm mb-4 line-clamp-2">{video.description}</p>

        {/* Status */}
        <div className="flex items-center justify-between mb-4">
          <span className={`text-sm font-semibold ${
            video.completed 
              ? 'text-green-400' 
              : 'text-yellow-400'
          }`}>
            {video.completed ? '✅ Completed' : '⏳ Not Completed'}
          </span>
        </div>

        {/* Mark Complete Button */}
        {!video.completed && (
          <button
            onClick={onMarkComplete}
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition group-hover:shadow-lg"
          >
            Mark Completed
          </button>
        )}
      </div>

    </div>
  );
}


export default StudentDashboard;