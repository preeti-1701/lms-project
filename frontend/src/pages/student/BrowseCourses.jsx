import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { BookOpen, Play, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const BrowseCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => {
    api.get('/courses/public').then(r => setCourses(r.data.courses)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const enroll = async (id, e) => {
    e.stopPropagation();
    try {
      await api.post(`/courses/${id}/enroll`);
      toast.success('Enrolled successfully!');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error enrolling'); }
  };

  if (loading) return <div className="page-loader"><div className="spinner" style={{ width:44, height:44 }} /></div>;

  return (
    <div className="anim-fade">
      <div className="page-header">
        <div>
          <h2 className="page-title">Browse Courses</h2>
          <p className="page-sub">{courses.length} published course{courses.length !== 1 ? 's' : ''} available</p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="empty">
          <BookOpen style={{ width:64, height:64 }} />
          <h3>No courses available</h3>
          <p>Check back later — trainers are creating content for you!</p>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map(c => (
            <div key={c.id} className="course-card">
              <div className="course-thumb">
                <span className="course-thumb-emoji">📚</span>
                {c.isEnrolled && (
                  <span style={{ position:'absolute', top:12, right:12, background:'rgba(16,185,129,.2)', border:'1px solid rgba(16,185,129,.4)', borderRadius:100, padding:'3px 10px', fontSize:11, fontWeight:700, color:'#6ee7b7' }}>
                    ✓ Enrolled
                  </span>
                )}
                {c.category && <span className="badge badge-primary" style={{ position:'absolute', top:12, left:12 }}>{c.category}</span>}
              </div>
              <div className="course-body">
                <div className="course-title">{c.title}</div>
                <div className="course-desc">{c.description || 'No description'}</div>
                <div className="course-meta">
                  <span>🎬 {c.videos?.length || 0} videos</span>
                  {c.trainer && <span>👤 {c.trainer.name}</span>}
                </div>
                <div style={{ marginTop:14, display:'flex', gap:8 }}>
                  {c.isEnrolled ? (
                    <button className="btn btn-success w-full" onClick={() => navigate(`/student/course/${c.id}`)}>
                      <Play size={15} /> Continue Learning
                    </button>
                  ) : (
                    <button className="btn btn-primary w-full" onClick={e => enroll(c.id, e)}>
                      <CheckCircle size={15} /> Enroll Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseCourses;
