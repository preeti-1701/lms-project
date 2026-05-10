import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function Catalog({ user }) {
  const [courses, setCourses] = useState([])
  const [enrolledSlugs, setEnrolledSlugs] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [enrolling, setEnrolling] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([api.courses(), api.me()])
      .then(([coursesData, meData]) => {
        setCourses(coursesData.results || coursesData)
        setEnrolledSlugs(new Set((meData.enrollments || []).map(e => e.course.slug)))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleEnroll = async (e, slug) => {
    e.stopPropagation()
    setEnrolling(slug)
    try {
      await api.enroll(slug)
      setEnrolledSlugs(prev => new Set([...prev, slug]))
      // Small delay for UX then navigate to course
      setTimeout(() => navigate(`/courses/${slug}`), 400)
    } catch (err) {
      alert('Enrollment failed: ' + err.message)
      setEnrolling(null)
    }
  }

  const filteredCourses = courses.filter(c => {
    if (levelFilter !== 'all' && c.level !== levelFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      )
    }
    return true
  })

  if (loading) return <div className="loading">Loading catalog</div>

  return (
    <div className="dash-wrap">
      <div className="dash-hero-strip">
        <div>
          <div className="kicker">
            <span className="kicker-dot"></span>
            Course Catalog
          </div>
          <h1 className="display dash-greeting">
            Find your <em>next course.</em>
          </h1>
          <p className="dash-subtitle">
            Browse {courses.length} courses across Python, Django, databases, machine learning, and more.
            Pick one and start learning.
          </p>
        </div>
      </div>

      <div className="dash-section">
        <div className="catalog-filter-bar">
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="catalog-search"
          />
          <div className="catalog-filters">
            {['all', 'beginner', 'intermediate', 'advanced'].map(level => (
              <button
                key={level}
                className={`filter-pill ${levelFilter === level ? 'active' : ''}`}
                onClick={() => setLevelFilter(level)}
              >
                {level === 'all' ? 'All levels' : level}
              </button>
            ))}
          </div>
        </div>

        <div className="course-grid-rich">
          {filteredCourses.map(course => {
            const isEnrolled = enrolledSlugs.has(course.slug)
            const isEnrolling = enrolling === course.slug
            return (
              <div
                key={course.id}
                className="course-card-rich"
                onClick={() => navigate(`/courses/${course.slug}`)}
              >
                <div className="course-card-top">
                  <div className="course-emoji-big">{course.thumbnail_emoji}</div>
                  <div className={`level-pill level-${course.level}`}>{course.level}</div>
                </div>
                <div className="course-category">{course.category}</div>
                <h3 className="course-title-rich">{course.title}</h3>
                <p className="course-desc-rich">{course.description}</p>
                <div className="course-instr-row">
                  <div className="instr-dot"></div>
                  <span>by {course.instructor?.first_name} {course.instructor?.last_name}</span>
                </div>
                <div className="course-foot-rich">
                  <div className="course-meta-row">
                    <span>📖 {course.lesson_count} lessons</span>
                    <span>👥 {course.enrollment_count} students</span>
                  </div>
                  {isEnrolled ? (
                    <div className="enrolled-tag">
                      ✓ Enrolled
                    </div>
                  ) : (
                    <button
                      className="btn btn-accent enroll-btn"
                      onClick={(e) => handleEnroll(e, course.slug)}
                      disabled={isEnrolling}
                    >
                      {isEnrolling ? 'Enrolling...' : 'Enroll →'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {filteredCourses.length === 0 && (
          <div className="empty-state-big">
            <div className="empty-emoji">🔍</div>
            <h3>No courses match your filters</h3>
            <p>Try adjusting your search or clearing the filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
