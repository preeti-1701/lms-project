import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="landing">
      {/* Navbar (only shown on landing when logged out) */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <span className="nav-brand-mark"></span>
          Coursify
        </div>
        <div className="landing-nav-right">
          <Link to="/login">Sign in</Link>
          <Link to="/signup" className="btn btn-accent" style={{ padding: '0.55rem 1.2rem', fontSize: '0.9rem' }}>
            Get started →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="kicker">
          <span className="kicker-dot"></span>
          Learning Management System
        </div>
        <h1 className="landing-title">
          Learn the things <em>you actually</em><br/>want to know.
        </h1>
        <p className="landing-sub">
          Coursify is a modern learning platform for students and instructors.
          Enroll in courses, watch secure video lessons, take quizzes,
          and track your progress — all in one place.
        </p>
        <div className="landing-cta">
          <Link to="/signup" className="btn btn-accent" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
            Get started free →
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
            Sign in
          </Link>
        </div>
        <div className="landing-note">
          ◇ No credit card · Email verification · Free forever
        </div>
      </section>

      {/* Stats */}
      <section className="landing-stats">
        <div className="landing-stat">
          <div className="landing-stat-value">6<span>+</span></div>
          <div className="landing-stat-label">Courses</div>
        </div>
        <div className="landing-stat">
          <div className="landing-stat-value">20<span>+</span></div>
          <div className="landing-stat-label">Lessons</div>
        </div>
        <div className="landing-stat">
          <div className="landing-stat-value">100<span>%</span></div>
          <div className="landing-stat-label">Free to enroll</div>
        </div>
        <div className="landing-stat">
          <div className="landing-stat-value">24<span>/7</span></div>
          <div className="landing-stat-label">Access</div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <div className="section-head" style={{ marginBottom: '3rem', justifyContent: 'flex-start', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div className="kicker">
            <span className="kicker-dot"></span>
            What's inside
          </div>
          <h2 className="section-title" style={{ fontSize: '2.5rem', marginTop: '0.75rem' }}>
            Built for <em>real learning</em>.
          </h2>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-emoji">🎯</div>
            <h3>Progress tracking</h3>
            <p>Every lesson you complete updates your progress bar. See exactly how far you've come — not a vibe, an actual percentage.</p>
          </div>
          <div className="feature-card">
            <div className="feature-emoji">🧠</div>
            <h3>Auto-graded quizzes</h3>
            <p>Take multiple-choice quizzes after each course. Instant scoring with pass/fail thresholds set by your instructor.</p>
          </div>
          <div className="feature-card">
            <div className="feature-emoji">🔒</div>
            <h3>Secure video content</h3>
            <p>Dynamic watermarks, right-click protection, and token authentication keep course material where it belongs.</p>
          </div>
          <div className="feature-card">
            <div className="feature-emoji">📧</div>
            <h3>Email verification</h3>
            <p>Every student account is verified via a 6-digit OTP sent to your email. Your progress is tied to a real person.</p>
          </div>
          <div className="feature-card">
            <div className="feature-emoji">👩‍🏫</div>
            <h3>Instructor tools</h3>
            <p>Teachers create courses, add lessons and quizzes, and see exactly which students have completed what.</p>
          </div>
          <div className="feature-card">
            <div className="feature-emoji">📱</div>
            <h3>Works everywhere</h3>
            <p>Fully responsive design. Learn on your laptop, continue on your phone. Same account, same progress.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-final-cta">
        <div className="final-cta-inner">
          <h2>Ready to start <em>learning</em>?</h2>
          <p>Create an account in under a minute. Your first course is waiting.</p>
          <div className="landing-cta">
            <Link to="/signup" className="btn btn-accent" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
              Create your account →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div>
          <span className="nav-brand-mark" style={{ marginRight: '0.5rem' }}></span>
          Coursify
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--ink-softer)' }}>
          Built with Django + React · Python Backend Internship Project
        </div>
      </footer>
    </div>
  )
}
