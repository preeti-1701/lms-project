import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import Sidebar from '../components/dashboard/Sidebar';
import DashHeader from '../components/dashboard/DashHeader';

const NAV = [
  { label: 'Trainer', items: [
    { section: 'overview', title: 'Dashboard', iconPath: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>' },
    { section: 'courses', title: 'My Courses', iconPath: '<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>' },
    { section: 'students', title: 'Students', iconPath: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>' },
    { section: 'analytics', title: 'Analytics', iconPath: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
  ]},
  { label: 'Account', items: [
    { section: 'settings', title: 'Settings', iconPath: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>' },
  ]},
];

function getYtId(url) {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/|\/embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default function TrainerDashboard() {
  const { currentUser, courses, users, logout, createCourse, addVideo, deleteVideo, getCourseProgress, showToast } = useApp();
  const navigate = useNavigate();
  const [section, setSection] = useState('overview');
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [search, setSearch] = useState('');
  // Add course modal
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [cTitle, setCTitle] = useState(''); const [cDesc, setCDesc] = useState('');
  const [cCat, setCCat] = useState(''); const [cIcon, setCIcon] = useState('💻');
  // Add video modal
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [targetCourse, setTargetCourse] = useState(null);
  const [vTitle, setVTitle] = useState(''); const [vUrl, setVUrl] = useState(''); const [vDur, setVDur] = useState('');

  const handleNav = (s) => {
    if (s === '__logout__') { logout(); navigate('/'); return; }
    setSection(s);
  };

  const myCourses = courses.filter(c => c.trainerId === currentUser?.id);
  const allStudents = users.filter(u => u.role === 'student');
  const myStudents = allStudents.filter(s => myCourses.some(c => (s.assignedCourses || []).includes(c.id)));
  const totalVideos = myCourses.reduce((s, c) => s + c.videos.length, 0);
  const completionRate = myStudents.length && myCourses.length
    ? Math.round(myStudents.reduce((total, s) =>
        total + myCourses.reduce((st, c) => st + getCourseProgress(s.id, c.id), 0) / myCourses.length, 0) / myStudents.length)
    : null;

  const handleCreateCourse = async () => {
    if (!cTitle || !cCat) return showToast('Please fill title and category.', 'error');
    const created = await createCourse(currentUser.id, currentUser.name, {
      title: cTitle,
      description: cDesc,
      category: cCat,
      icon: cIcon,
    });
    if (!created) return;
    setCTitle(''); setCDesc(''); setCCat(''); setCIcon('💻');
    setShowAddCourse(false);
  };

  const handleAddVideo = () => {
    if (!vTitle || !vUrl) return showToast('Please fill title and URL.', 'error');
    if (!getYtId(vUrl)) return showToast('Please enter a valid YouTube URL.', 'error');
    addVideo(targetCourse, { title: vTitle, url: vUrl, duration: vDur });
    setVTitle(''); setVUrl(''); setVDur('');
    setShowAddVideo(false); setTargetCourse(null);
  };

  const CourseManageCard = ({ course }) => {
    const expanded = expandedCourse === course.id;
    return (
      <div className="course-manage-card">
        <div className="course-manage-head" onClick={() => setExpandedCourse(expanded ? null : course.id)}>
          <div className="course-manage-icon" style={{ background:'rgba(139,92,246,0.1)' }}>{course.icon}</div>
          <div className="course-manage-info">
            <div className="course-manage-title">{course.title}</div>
            <div className="course-manage-meta"><span>{course.category}</span><span>{course.videos.length} videos</span></div>
          </div>
          <div className="course-manage-actions">
            <button className="btn-sm btn-sm-primary" onClick={e => { e.stopPropagation(); setTargetCourse(course.id); setShowAddVideo(true); }}>+ Video</button>
            <button className="btn-sm" style={{ color:'var(--text-muted)' }}>{expanded ? '▲' : '▼'}</button>
          </div>
        </div>
        {expanded && (
          <div className="video-manage-list">
            {course.videos.map((v, i) => (
              <div key={v.id} className="video-manage-item">
                <div className="video-manage-num">{i + 1}</div>
                <div className="video-manage-info">
                  <div className="video-manage-title">{v.title}</div>
                  <div className="video-manage-url">{v.url}</div>
                </div>
                <div className="video-manage-actions">
                  <button className="btn-sm btn-sm-danger" onClick={() => deleteVideo(course.id, v.id)}>Delete</button>
                </div>
              </div>
            ))}
            {course.videos.length === 0 && <div className="add-video-row" style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>No videos yet. Click "+ Video" to add.</div>}
          </div>
        )}
      </div>
    );
  };

  const filteredStudents = myStudents.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="dash-layout">
      <Sidebar navItems={NAV} role="trainer" activeSection={section} onNav={handleNav} />
      <div className="main-content">
        <DashHeader title="Trainer Dashboard" role="trainer">
          <button className="btn-sm btn-sm-primary" style={{ padding:'8px 16px' }} onClick={() => setShowAddCourse(true)}>+ New Course</button>
        </DashHeader>
        <div className="content-area">

          {/* OVERVIEW */}
          {section === 'overview' && (
            <div className="content-section active">
              <div className="page-title">Trainer Dashboard</div>
              <div className="page-subtitle">Manage your courses and track student performance.</div>
              <div className="stats-row">
                {[
                  { label:'My Courses', value: myCourses.length, gradient:'linear-gradient(90deg,#8B5CF6,#3B82F6)' },
                  { label:'Total Students', value: myStudents.length, gradient:'linear-gradient(90deg,#10B981,#06B6D4)' },
                  { label:'Total Videos', value: totalVideos, gradient:'linear-gradient(90deg,#3B82F6,#8B5CF6)' },
                  { label:'Completion Rate', value: completionRate != null ? completionRate + '%' : '—', gradient:'linear-gradient(90deg,#F59E0B,#EC4899)' },
                ].map(s => (
                  <div key={s.label} className="stat-card" style={{'--card-gradient': s.gradient}}>
                    <div className="stat-header"><span className="stat-label">{s.label}</span></div>
                    <div className="stat-value">{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="section-header">
                <span className="section-title">Recent Courses</span>
                <button className="section-action" onClick={() => setSection('courses')}>Manage All →</button>
              </div>
              {myCourses.slice(0,3).map(c => <CourseManageCard key={c.id} course={c} />)}
              {myCourses.length === 0 && <div className="empty-state"><div className="empty-icon">📚</div><p>No courses yet. Click "+ New Course" to create one!</p></div>}
            </div>
          )}

          {/* MY COURSES */}
          {section === 'courses' && (
            <div className="content-section active">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                <div><div className="page-title">My Courses</div><div className="page-subtitle">Create and manage course content.</div></div>
                <button className="btn-sm btn-sm-primary" style={{ padding:'10px 20px' }} onClick={() => setShowAddCourse(true)}>+ Add Course</button>
              </div>
              {myCourses.length === 0
                ? <div className="empty-state"><div className="empty-icon">📚</div><p>No courses yet.</p></div>
                : myCourses.map(c => <CourseManageCard key={c.id} course={c} />)
              }
            </div>
          )}

          {/* STUDENTS */}
          {section === 'students' && (
            <div className="content-section active">
              <div className="page-title">My Students</div>
              <div className="page-subtitle">Students enrolled in your courses.</div>
              <div className="table-wrapper">
                <div className="table-header">
                  <span className="table-title">Enrolled Students</span>
                  <div className="search-box">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" placeholder="Search students…" value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                </div>
                <table className="data-table">
                  <thead><tr><th>Student</th><th>Courses</th><th>Joined</th><th>Progress</th></tr></thead>
                  <tbody>
                    {filteredStudents.map(s => {
                      const enrolled = myCourses.filter(c => (s.assignedCourses || []).includes(c.id));
                      const avg = enrolled.length ? Math.round(enrolled.reduce((t, c) => t + getCourseProgress(s.id, c.id), 0) / enrolled.length) : 0;
                      return (
                        <tr key={s.id}>
                          <td><strong>{s.name}</strong><br/><span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{s.email}</span></td>
                          <td>{enrolled.length}</td>
                          <td style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{new Date(s.joined).toLocaleDateString()}</td>
                          <td><div style={{ display:'flex', alignItems:'center', gap:8 }}><div className="progress-bar" style={{ flex:1 }}><div className="progress-fill" style={{ width: avg + '%' }} /></div><span style={{ fontSize:'0.78rem' }}>{avg}%</span></div></td>
                        </tr>
                      );
                    })}
                    {filteredStudents.length === 0 && <tr><td colSpan={4} style={{ textAlign:'center', color:'var(--text-muted)' }}>No students found</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {section === 'analytics' && (
            <div className="content-section active">
              <div className="page-title">Analytics</div>
              <div className="page-subtitle">Performance overview across your courses.</div>
              {myCourses.map(c => {
                const enrolled = allStudents.filter(s => (s.assignedCourses || []).includes(c.id));
                const avg = enrolled.length ? Math.round(enrolled.reduce((t, s) => t + getCourseProgress(s.id, c.id), 0) / enrolled.length) : 0;
                return (
                  <div key={c.id} className="table-wrapper" style={{ marginBottom:16 }}>
                    <div className="table-header"><span className="table-title">{c.icon} {c.title}</span><span className="badge badge-student">{enrolled.length} students · {avg}% avg</span></div>
                    <div style={{ padding:'16px 20px' }}>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: avg + '%' }} /></div>
                    </div>
                  </div>
                );
              })}
              {myCourses.length === 0 && <div className="empty-state"><div className="empty-icon">📊</div><p>No courses to analyze yet.</p></div>}
            </div>
          )}

          {/* SETTINGS */}
          {section === 'settings' && (
            <div className="content-section active">
              <div className="page-title">Settings</div>
              <div className="page-subtitle">Manage your trainer profile.</div>
              <div className="settings-grid">
                <div className="settings-card">
                  <h3>👤 Profile</h3>
                  <div className="form-group"><label>Full Name</label><input className="form-control" defaultValue={currentUser?.name} /></div>
                  <div className="form-group"><label>Email</label><input className="form-control" defaultValue={currentUser?.email} type="email" /></div>
                  <div className="form-group"><label>Subject / Area</label><input className="form-control" defaultValue={currentUser?.subject} /></div>
                  <div className="form-group"><label>Bio</label><textarea className="form-control" rows={3} defaultValue={currentUser?.bio} /></div>
                  <button className="btn-sm btn-sm-success" style={{ marginTop:8 }} onClick={() => showToast('Profile saved!', 'success')}>Save Profile</button>
                </div>
                <div className="settings-card">
                  <h3>🔐 Security</h3>
                  <div className="form-group"><label>Current Password</label><input className="form-control" type="password" placeholder="••••••••" /></div>
                  <div className="form-group"><label>New Password</label><input className="form-control" type="password" placeholder="Min. 8 characters" /></div>
                  <div className="form-group"><label>Confirm Password</label><input className="form-control" type="password" placeholder="Repeat new password" /></div>
                  <button className="btn-sm btn-sm-success" style={{ marginTop:8 }} onClick={() => showToast('Password updated!', 'success')}>Update Password</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Course Modal */}
      {showAddCourse && (
        <div className="modal-overlay dash open">
          <div className="modal-box">
            <div className="modal-head"><h3>📚 Create New Course</h3><button className="modal-close-btn" onClick={() => setShowAddCourse(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group"><label>Course Title *</label><input className="form-control" value={cTitle} onChange={e => setCTitle(e.target.value)} placeholder="e.g. Advanced Python Programming" /></div>
              <div className="form-group"><label>Description *</label><textarea className="form-control" rows={3} value={cDesc} onChange={e => setCDesc(e.target.value)} placeholder="Brief description…" /></div>
              <div className="form-row-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div className="form-group"><label>Category *</label>
                  <select className="form-control" value={cCat} onChange={e => setCCat(e.target.value)}>
                    <option value="">Select category</option>
                    <option>Web Development</option>
                    <option>Data Science</option>
                    <option>Mobile Development</option>
                    <option>Cloud Computing</option>
                    <option>Cybersecurity</option>
                    <option>AI/ML</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group"><label>Course Icon</label>
                  <select className="form-control" value={cIcon} onChange={e => setCIcon(e.target.value)}>
                    <option value="💻">💻 Code</option><option value="📊">📊 Data</option><option value="🤖">🤖 AI</option>
                    <option value="🎨">🎨 Design</option><option value="⚙️">⚙️ Backend</option><option value="📱">📱 Mobile</option><option value="🐍">🐍 Python</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer"><button className="btn-sm" onClick={() => setShowAddCourse(false)}>Cancel</button><button className="btn-sm btn-sm-primary" style={{ padding:'8px 20px' }} onClick={handleCreateCourse}>Create Course</button></div>
          </div>
        </div>
      )}

      {/* Add Video Modal */}
      {showAddVideo && (
        <div className="modal-overlay dash open">
          <div className="modal-box">
            <div className="modal-head"><h3>🎬 Add Video</h3><button className="modal-close-btn" onClick={() => setShowAddVideo(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group"><label>Video Title *</label><input className="form-control" value={vTitle} onChange={e => setVTitle(e.target.value)} placeholder="e.g. Introduction to Variables" /></div>
              <div className="form-group">
                <label>YouTube URL *</label>
                <input className="form-control" value={vUrl} onChange={e => setVUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
                {getYtId(vUrl) && (
                  <div className="yt-preview" style={{ display:'flex', marginTop:8 }}>
                    <img className="yt-thumb" src={`https://img.youtube.com/vi/${getYtId(vUrl)}/mqdefault.jpg`} alt="thumbnail" />
                    <div style={{ marginLeft:10 }}><div style={{ fontWeight:600, fontSize:'0.82rem' }}>Valid YouTube URL ✓</div><div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>ID: {getYtId(vUrl)}</div></div>
                  </div>
                )}
              </div>
              <div className="form-group"><label>Duration</label><input className="form-control" value={vDur} onChange={e => setVDur(e.target.value)} placeholder="e.g. 12:30" /></div>
            </div>
            <div className="modal-footer"><button className="btn-sm" onClick={() => setShowAddVideo(false)}>Cancel</button><button className="btn-sm btn-sm-primary" style={{ padding:'8px 20px' }} onClick={handleAddVideo}>Add Video</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
