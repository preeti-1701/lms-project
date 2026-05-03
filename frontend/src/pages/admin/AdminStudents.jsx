import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Search, BookOpen, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AssignModal = ({ student, courses, onClose, onSaved }) => {
  const [sel, setSel] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    if (!sel) return;
    setLoading(true);
    try {
      await api.post(`/courses/${sel}/assign`, { student_id: student.id });
      toast.success('Course assigned!');
      onSaved();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Assign Course to {student.name}</h2>
          <button className="modal-close" onClick={onClose}><X /></button>
        </div>
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="form-group">
            <label className="form-label">Select Course</label>
            <select className="form-input" value={sel} onChange={e => setSel(e.target.value)}>
              <option value="">-- Choose course --</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
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

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [courses,  setCourses]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sr, cr] = await Promise.all([api.get('/users?role=student'), api.get('/courses')]);
      setStudents(sr.data.users);
      setCourses(cr.data.courses);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="anim-fade">
      <div className="page-header">
        <div>
          <h2 className="page-title">Students</h2>
          <p className="page-sub">{students.length} registered students</p>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div className="search-bar">
          <Search size={16} />
          <input placeholder="Search students…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? <div className="page-loader"><div className="spinner" style={{ width:44, height:44 }} /></div> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Email</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--text-3)', padding:40 }}>No students found</td></tr>
              )}
              {filtered.map(s => (
                <tr key={s.id}>
                  <td style={{ color:'var(--text-3)', fontSize:13 }}>{s.static_user_id}</td>
                  <td style={{ fontWeight:600 }}>{s.name}</td>
                  <td style={{ color:'var(--text-2)', fontSize:14 }}>{s.email}</td>
                  <td><span className={`badge ${s.is_active ? 'badge-success':'badge-danger'}`}>{s.is_active ? 'Active':'Disabled'}</span></td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => setModal(s)}>
                      <BookOpen size={13} /> Assign Course
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <AssignModal student={modal} courses={courses} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />
      )}
    </div>
  );
};

export default AdminStudents;
