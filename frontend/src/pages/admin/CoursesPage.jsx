import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Video, ChevronDown, ChevronUp, Eye, EyeOff, X } from 'lucide-react';
import toast from 'react-hot-toast';

// Course modal
const CourseModal = ({ course, isAdmin, onClose, onSaved }) => {
  const [form, setForm] = useState(course || { title:'', description:'', category:'', is_published:false, trainer_id:'' });
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  useEffect(() => {
    if (isAdmin) api.get('/users?role=trainer').then(r => setTrainers(r.data.users)).catch(() => {});
  }, [isAdmin]);

  const submit = async e => {
    e.preventDefault();
    if (!form.title) { setError('Title is required'); return; }
    setLoading(true); setError('');
    try {
      if (course) await api.put(`/courses/${course.id}`, form);
      else        await api.post('/courses', form);
      toast.success(course ? 'Course updated' : 'Course created');
      onSaved();
    } catch (err) { setError(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{course ? 'Edit Course' : 'Create Course'}</h2>
          <button className="modal-close" onClick={onClose}><X /></button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" value={form.title} onChange={set('title')} placeholder="e.g. Intro to React" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} value={form.description||''} onChange={set('description')} style={{ resize:'vertical' }} />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <input className="form-input" value={form.category||''} onChange={set('category')} placeholder="e.g. Web Development" />
          </div>
          {isAdmin && trainers.length > 0 && (
            <div className="form-group">
              <label className="form-label">Assign Trainer</label>
              <select className="form-input" value={form.trainer_id||''} onChange={set('trainer_id')}>
                <option value="">-- No trainer --</option>
                {trainers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.email})</option>)}
              </select>
            </div>
          )}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <input type="checkbox" id="pub" checked={!!form.is_published} onChange={set('is_published')} style={{ width:16, height:16 }} />
            <label htmlFor="pub" className="form-label" style={{ margin:0 }}>Published (visible to students)</label>
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="spinner" /> : course ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Video modal
const VideoModal = ({ courseId, video, onClose, onSaved }) => {
  const [form, setForm] = useState(video || { title:'', youtube_url:'', description:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.title || !form.youtube_url) { setError('Title and YouTube URL required'); return; }
    setLoading(true); setError('');
    try {
      if (video) await api.put(`/courses/${courseId}/videos/${video.id}`, form);
      else       await api.post(`/courses/${courseId}/videos`, form);
      toast.success(video ? 'Video updated' : 'Video added');
      onSaved();
    } catch (err) { setError(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{video ? 'Edit Video' : 'Add Video'}</h2>
          <button className="modal-close" onClick={onClose}><X /></button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="form-group">
            <label className="form-label">Video Title *</label>
            <input className="form-input" value={form.title} onChange={set('title')} placeholder="Lesson 1 — Introduction" />
          </div>
          <div className="form-group">
            <label className="form-label">YouTube URL *</label>
            <input className="form-input" type="url" value={form.youtube_url} onChange={set('youtube_url')} placeholder="https://www.youtube.com/watch?v=..." />
            <span className="form-hint">Supports youtube.com/watch and youtu.be links</span>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={2} value={form.description||''} onChange={set('description')} style={{ resize:'vertical' }} />
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="spinner" /> : video ? 'Save' : 'Add Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Assign modal
const AssignModal = ({ course, onClose, onSaved }) => {
  const [students, setStudents] = useState([]);
  const [sel, setSel] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/users?role=student').then(r => setStudents(r.data.users)).catch(() => {});
  }, []);

  const submit = async e => {
    e.preventDefault();
    if (!sel) return;
    setLoading(true);
    try {
      await api.post(`/courses/${course.id}/assign`, { student_id: sel });
      toast.success('Course assigned!');
      onSaved();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Assign Course</h2>
          <button className="modal-close" onClick={onClose}><X /></button>
        </div>
        <p style={{ color:'var(--text-2)', fontSize:14, marginBottom:20 }}>
          Assign <strong style={{ color:'var(--text)' }}>{course.title}</strong> to a student
        </p>
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="form-group">
            <label className="form-label">Select Student</label>
            <select className="form-input" value={sel} onChange={e => setSel(e.target.value)}>
              <option value="">-- Choose student --</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.static_user_id})</option>)}
            </select>
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !sel}>
              {loading ? <div className="spinner" /> : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main
const CoursesPage = ({ isAdmin = false }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/courses'); setCourses(data.courses); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const deleteCourse = async id => {
    if (!window.confirm('Delete this course and all its videos?')) return;
    try { await api.delete(`/courses/${id}`); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const deleteVideo = async (cid, vid) => {
    if (!window.confirm('Delete this video?')) return;
    try { await api.delete(`/courses/${cid}/videos/${vid}`); toast.success('Video deleted'); load(); }
    catch { toast.error('Error deleting video'); }
  };

  const togglePublish = async c => {
    try { await api.put(`/courses/${c.id}`, { is_published: !c.is_published }); load(); }
    catch { toast.error('Error updating course'); }
  };

  return (
    <div className="anim-fade">
      <div className="page-header">
        <div>
          <h2 className="page-title">{isAdmin ? 'All Courses' : 'My Courses'}</h2>
          <p className="page-sub">{courses.length} course{courses.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ type:'course', data:null })}>
          <Plus size={16} /> New Course
        </button>
      </div>

      {loading ? <div className="page-loader"><div className="spinner" style={{ width:44, height:44 }} /></div> : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {courses.length === 0 && (
            <div className="empty">
              <Video style={{ width:64, height:64 }} /><h3>No courses yet</h3><p>Create your first course to get started</p>
            </div>
          )}
          {courses.map(c => (
            <div key={c.id} className="card" style={{ padding:0, overflow:'hidden' }}>
              <div style={{ padding:'18px 20px', display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4, flexWrap:'wrap' }}>
                    <h3 style={{ fontSize:16, fontWeight:700 }}>{c.title}</h3>
                    <span className={`badge ${c.is_published ? 'badge-success' : 'badge-warning'}`}>
                      {c.is_published ? 'Published' : 'Draft'}
                    </span>
                    {c.category && <span className="badge badge-primary">{c.category}</span>}
                  </div>
                  <div style={{ fontSize:13, color:'var(--text-2)', display:'flex', gap:16, flexWrap:'wrap' }}>
                    {c.trainer && <span>👤 {c.trainer.name}</span>}
                    <span>🎬 {c.videos?.length || 0} videos</span>
                  </div>
                </div>
                <div style={{ display:'flex', gap:7, alignItems:'center', flexWrap:'wrap' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => togglePublish(c)} title={c.is_published ? 'Unpublish':'Publish'}>
                    {c.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setModal({ type:'video', courseId:c.id, data:null })}>
                    <Video size={13} /> Add Video
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setModal({ type:'assign', course:c })}>
                    Assign
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setModal({ type:'course', data:c })}>
                    <Edit2 size={13} />
                  </button>
                  {isAdmin && (
                    <button className="btn btn-danger btn-sm" onClick={() => deleteCourse(c.id)}>
                      <Trash2 size={13} />
                    </button>
                  )}
                  <button className="btn btn-secondary btn-sm" onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
                    {expanded === c.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {expanded === c.id && (
                <div style={{ borderTop:'1px solid var(--border)', padding:'14px 20px', background:'#f7f9ff' }}>
                  <h4 style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', marginBottom:10, textTransform:'uppercase', letterSpacing:'.06em' }}>Videos</h4>
                  {!c.videos?.length ? (
                    <p style={{ fontSize:13, color:'var(--text-3)' }}>No videos yet — add one above!</p>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      {[...c.videos].sort((a,b) => a.order_index - b.order_index).map((v, i) => (
                        <div key={v.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:'white', borderRadius:8, border:'1px solid var(--border)' }}>
                          <div className="video-num">{i+1}</div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontWeight:500, fontSize:14 }}>{v.title}</div>
                            <div style={{ fontSize:12, color:'var(--text-3)' }}>{v.youtube_id}</div>
                          </div>
                          <div style={{ display:'flex', gap:6 }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => setModal({ type:'video', courseId:c.id, data:v })}><Edit2 size={12} /></button>
                            <button className="btn btn-danger btn-sm" onClick={() => deleteVideo(c.id, v.id)}><Trash2 size={12} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modal?.type === 'course' && (
        <CourseModal course={modal.data} isAdmin={isAdmin} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />
      )}
      {modal?.type === 'video' && (
        <VideoModal courseId={modal.courseId} video={modal.data} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />
      )}
      {modal?.type === 'assign' && (
        <AssignModal course={modal.course} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />
      )}
    </div>
  );
};

export default CoursesPage;
