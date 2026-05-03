import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Play, BookOpen } from 'lucide-react';

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data.courses)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" style={{ width:44, height:44 }} /></div>;

  return (
    <div className="anim-fade">
      <div className="page-header">
        <div>
          <h2 className="page-title">My Courses</h2>
          <p className="page-sub">{courses.length} course{courses.length !== 1 ? 's' : ''} assigned</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/student/browse')}>Browse More</button>
      </div>

      {courses.length === 0 ? (
        <div className="empty">
          <BookOpen style={{ width:64, height:64 }} />
          <h3>No courses assigned yet</h3>
          <p>Your trainer or admin will assign courses to you soon.</p>
          <button className="btn btn-primary" style={{ marginTop:16 }} onClick={() => navigate('/student/browse')}>Browse Courses</button>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map(c => (
            <div key={c.id} className="course-card" onClick={() => navigate(`/student/course/${c.id}`)}>
              <div className="course-thumb">
                <span className="course-thumb-emoji">📖</span>
                {c.category && <span className="badge badge-primary" style={{ position:'absolute', top:12, left:12 }}>{c.category}</span>}
              </div>
              <div className="course-body">
                <div className="course-title">{c.title}</div>
                <div className="course-desc">{c.description || 'No description provided'}</div>
                <div className="course-meta">
                  <span>🎬 {c.videos?.length || 0} videos</span>
                  {c.trainer && <span>👤 {c.trainer.name}</span>}
                </div>
                <button className="btn btn-primary w-full" style={{ marginTop:14 }} onClick={e => { e.stopPropagation(); navigate(`/student/course/${c.id}`); }}>
                  <Play size={15} /> Start Learning
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
