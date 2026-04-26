import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import Sidebar from '../components/dashboard/Sidebar';
import DashHeader from '../components/dashboard/DashHeader';

const NAV = [
  { label: 'Main', items: [
    { section: 'overview', title: 'Dashboard', iconPath: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>' },
    { section: 'courses', title: 'My Courses', iconPath: '<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>' },
    { section: 'progress', title: 'Progress', iconPath: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
    { section: 'certificates', title: 'Certificates', iconPath: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>' },
  ]},
  { label: 'Account', items: [
    { section: 'settings', title: 'Settings', iconPath: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>' },
  ]},
];

export default function StudentDashboard() {
  const {
    currentUser,
    courses,
    enrollments,
    getCourseProgress,
    fetchCourseProgress,
    enrollCourse,
    logout,
    showToast,
  } = useApp();
  const navigate = useNavigate();
  const [section, setSection] = useState('overview');

  const enrolledCourses = enrollments.map(e => e.course).filter(Boolean);
  const enrolledCourseIds = new Set(enrolledCourses.map(c => c.id));
  const availableCourses = courses.filter(c => !enrolledCourseIds.has(c.id));
  const completedCourses = enrolledCourses.filter(c => getCourseProgress(currentUser?.id, c.id) === 100);
  const avgCompletion = enrolledCourses.length
    ? Math.round(enrolledCourses.reduce((s, c) => s + getCourseProgress(currentUser?.id, c.id), 0) / enrolledCourses.length)
    : 0;

  const handleNav = (s) => {
    if (s === '__logout__') { logout(); navigate('/'); return; }
    setSection(s);
  };

  useEffect(() => {
    enrollments.forEach((enrollment) => {
      if (enrollment.course?.id != null) {
        fetchCourseProgress(enrollment.course.id);
      }
    });
  }, [enrollments, fetchCourseProgress]);

  const CourseCard = ({ course }) => {
    const progress = getCourseProgress(currentUser?.id, course.id);
    const colors = ['linear-gradient(135deg,#3B82F6,#8B5CF6)', 'linear-gradient(135deg,#10B981,#06B6D4)', 'linear-gradient(135deg,#F59E0B,#EF4444)', 'linear-gradient(135deg,#8B5CF6,#EC4899)'];
    const idx = courses.indexOf(course) % colors.length;
    return (
      <div className="course-card" onClick={() => course.videos.length ? navigate(`/video/${course.id}/0`) : showToast('No videos yet.', 'info')}>
        <div className="course-thumb" style={{ background: colors[idx] }}><span style={{ fontSize: '3rem' }}>{course.icon}</span></div>
        <div className="course-body">
          <div className="course-title">{course.title}</div>
          <div className="course-meta">{course.trainerName} · {course.videos.length} videos</div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: progress + '%' }} /></div>
          <div className="progress-label"><span>{course.category}</span><span>{progress}%</span></div>
        </div>
      </div>
    );
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning! 👋' : hour < 17 ? 'Good afternoon! ☀️' : 'Good evening! 🌙';

  return (
    <div className="dash-layout">
      <Sidebar navItems={NAV} role="student" activeSection={section} onNav={handleNav} />
      <div className="main-content">
        <DashHeader title="Student Dashboard" role="student" />
        <div className="content-area">

          {/* OVERVIEW */}
          {section === 'overview' && (
            <div className="content-section active">
              <div className="page-title">{greeting}</div>
              <div className="page-subtitle">Here's your learning overview for today.</div>
              <div className="stats-row">
                {[
                  { label:'Enrolled Courses', value: enrolledCourses.length, gradient:'linear-gradient(90deg,#3B82F6,#06B6D4)' },
                  { label:'Avg. Completion', value: avgCompletion + '%', gradient:'linear-gradient(90deg,#10B981,#06B6D4)' },
                  { label:'Total Videos', value: enrolledCourses.reduce((s,c) => s + c.videos.length, 0), gradient:'linear-gradient(90deg,#8B5CF6,#EC4899)' },
                  { label:'Certificates', value: completedCourses.length, gradient:'linear-gradient(90deg,#F59E0B,#EF4444)' },
                ].map(s => (
                  <div key={s.label} className="stat-card" style={{'--card-gradient': s.gradient}}>
                    <div className="stat-header"><span className="stat-label">{s.label}</span></div>
                    <div className="stat-value">{s.value}</div>
                  </div>
                ))}
              </div>

              {enrolledCourses.length  && (
                <>
                  <div className="section-header">
                    <span className="section-title">▶ Continue Watching</span>
                  </div>
                  {enrolledCourses.filter(c => { const p = getCourseProgress(currentUser?.id, c.id); return p > 0 && p < 100; }).slice(0,3).map(c => (
                    <div key={c.id} className="continue-card" onClick={() => navigate(`/video/${c.id}/0`)}>
                      <div className="continue-thumb">{c.icon}</div>
                      <div className="continue-info">
                        <div className="continue-course">{c.category}</div>
                        <div className="continue-title">{c.title}</div>
                        <div className="progress-bar" style={{ marginTop: 6 }}><div className="progress-fill" style={{ width: getCourseProgress(currentUser?.id, c.id) + '%' }} /></div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              <div className="section-header">
                <span className="section-title">📚 My Courses</span>
                <button className="section-action" onClick={() => setSection('courses')}>View All →</button>
              </div>
              {enrolledCourses.length === 0
                ? <div className="empty-state"><div className="empty-icon">📚</div><p>No courses assigned yet. Check back later!</p></div>
                : <div className="courses-grid">{enrolledCourses.slice(0,4).map(c => <CourseCard key={c.id} course={c} />)}</div>
              }

              <div className="section-header" style={{ marginTop: 20 }}>
                <span className="section-title">✨ Available Courses</span>
              </div>
              {availableCourses.length === 0
                ? <div className="empty-state"><div className="empty-icon">🎉</div><p>You are already enrolled in all available courses.</p></div>
                : <div className="courses-grid">
                    {availableCourses.slice(0,4).map(course => (
                      <div key={course.id} className="course-card">
                        <div className="course-thumb" style={{ background:'linear-gradient(135deg,#0EA5E9,#8B5CF6)' }}><span style={{ fontSize: '3rem' }}>{course.icon}</span></div>
                        <div className="course-body">
                          <div className="course-title">{course.title}</div>
                          <div className="course-meta">{course.trainerName} · {course.videos.length} videos</div>
                          <div className="progress-label"><span>{course.category}</span><span>Not Enrolled</span></div>
                          <button className="btn-sm btn-sm-primary" style={{ marginTop: 10 }} onClick={() => enrollCourse(course.id)}>
                            Enroll Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

          {/* MY COURSES */}
          {section === 'courses' && (
            <div className="content-section active">
              <div className="page-title">My Courses</div>
              <div className="page-subtitle">All your enrolled courses in one place.</div>
              {enrolledCourses.length === 0
                ? <div className="empty-state"><div className="empty-icon">📚</div><p>No courses assigned yet.</p></div>
                : <div className="courses-grid">{enrolledCourses.map(c => <CourseCard key={c.id} course={c} />)}</div>
              }

              <div className="section-header" style={{ marginTop: 24 }}>
                <span className="section-title">Explore More Courses</span>
              </div>
              {availableCourses.length === 0
                ? <div className="empty-state"><div className="empty-icon">🎉</div><p>No additional courses available right now.</p></div>
                : <div className="courses-grid">
                    {availableCourses.map(course => (
                      <div key={course.id} className="course-card">
                        <div className="course-thumb" style={{ background:'linear-gradient(135deg,#0EA5E9,#8B5CF6)' }}><span style={{ fontSize: '3rem' }}>{course.icon}</span></div>
                        <div className="course-body">
                          <div className="course-title">{course.title}</div>
                          <div className="course-meta">{course.trainerName} · {course.videos.length} videos</div>
                          <div className="progress-label"><span>{course.category}</span><span>Not Enrolled</span></div>
                          <button className="btn-sm btn-sm-primary" style={{ marginTop: 10 }} onClick={() => enrollCourse(course.id)}>
                            Enroll Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

          {/* PROGRESS */}
          {section === 'progress' && (
            <div className="content-section active">
              <div className="page-title">My Progress</div>
              <div className="page-subtitle">Detailed breakdown of your learning journey.</div>
              <div className="table-wrapper">
                <div className="table-header"><span className="table-title">Course Progress Report</span></div>
                <table className="data-table">
                  <thead><tr><th>Course</th><th>Trainer</th><th>Videos</th><th>Progress</th><th>Status</th></tr></thead>
                  <tbody>
                    {enrolledCourses.map(c => {
                      const p = getCourseProgress(currentUser?.id, c.id);
                      return (
                        <tr key={c.id}>
                          <td><strong>{c.title}</strong></td>
                          <td>{c.trainerName}</td>
                          <td>{c.videos.length}</td>
                          <td>
                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                              <div className="progress-bar" style={{ flex:1 }}><div className="progress-fill" style={{ width: p + '%' }} /></div>
                              <span style={{ fontSize:'0.78rem', color:'var(--text-muted)', width: 36 }}>{p}%</span>
                            </div>
                          </td>
                          <td><span className={`badge ${p === 100 ? 'badge-active' : p > 0 ? 'badge-student' : 'badge-disabled'}`}>{p === 100 ? 'Completed' : p > 0 ? 'In Progress' : 'Not Started'}</span></td>
                        </tr>
                      );
                    })}
                    {enrolledCourses.length === 0 && <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--text-muted)' }}>No courses yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CERTIFICATES */}
          {section === 'certificates' && (
            <div className="content-section active">
              <div className="page-title">🏆 Certificates</div>
              <div className="page-subtitle">Courses you have fully completed.</div>
              {completedCourses.length === 0
                ? <div className="empty-state"><div className="empty-icon">🏆</div><p>Complete a course to earn your certificate!</p></div>
                : <div className="courses-grid">
                    {completedCourses.map(c => (
                      <div key={c.id} className="course-card">
                        <div className="course-thumb" style={{ background:'linear-gradient(135deg,#F59E0B,#EF4444)' }}><span style={{ fontSize:'3rem' }}>🏆</span></div>
                        <div className="course-body">
                          <div className="course-title">{c.title}</div>
                          <div className="course-meta">{c.trainerName}</div>
                          <button className="btn-sm btn-sm-success" style={{ marginTop:8 }} onClick={() => showToast('Certificate download coming soon!', 'info')}>Download Certificate</button>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

          {/* SETTINGS */}
          {section === 'settings' && (
            <div className="content-section active">
              <div className="page-title">Settings</div>
              <div className="page-subtitle">Manage your account preferences.</div>
              <div className="settings-grid">
                <div className="settings-card">
                  <h3>👤 Profile Information</h3>
                  <div className="form-group"><label>Full Name</label><input className="form-control" defaultValue={currentUser?.name} /></div>
                  <div className="form-group"><label>Email Address</label><input className="form-control" defaultValue={currentUser?.email} type="email" /></div>
                  <div className="form-group"><label>Mobile Number</label><input className="form-control" defaultValue={currentUser?.mobile} type="tel" /></div>
                  <button className="btn-sm btn-sm-success" style={{ marginTop:8 }} onClick={() => showToast('Profile saved!', 'success')}>Save Changes</button>
                </div>
                <div className="settings-card">
                  <h3>🔐 Security</h3>
                  <div className="form-group"><label>Current Password</label><input className="form-control" type="password" placeholder="••••••••" /></div>
                  <div className="form-group"><label>New Password</label><input className="form-control" type="password" placeholder="Min. 8 characters" /></div>
                  <div className="form-group"><label>Confirm New Password</label><input className="form-control" type="password" placeholder="Repeat new password" /></div>
                  <button className="btn-sm btn-sm-success" style={{ marginTop:8 }} onClick={() => showToast('Password updated!', 'success')}>Update Password</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
