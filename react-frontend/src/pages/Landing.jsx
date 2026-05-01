import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="landing">
      {/* Navbar (only shown on landing when logged out) */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <span className="nav-brand-mark"></span>
          LearnNova
        </div>
        <div className="landing-nav-right">
          <Link to="/login">Log in</Link>
          <Link to="/signup" className="btn btn-accent" style={{ padding: '0.55rem 1.2rem', fontSize: '0.9rem' }}>
            Create account →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="kicker">
          <span className="kicker-dot"></span>
          Your learning hub
        </div>
        <h1 className="landing-title">
          Learn skills that <em>matter</em><br/>and keep moving forward.
        </h1>
        <p className="landing-sub">
          LearnNova is a modern space for students and instructors to share knowledge.
          Join courses, access protected lesson resources, take quick quizzes,
          and watch your progress grow — in one simple dashboard.
        </p>
        <div className="landing-cta">
          <Link to="/signup" className="btn btn-accent" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
            Start learning →
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
            Log in
          </Link>
        </div>
        <div className="landing-note">
          ◇ No card needed · Email verification · Always free
        </div>
      </section>

      {/* Stats */}
      <section className="landing-stats">
        <div className="landing-stat">
          <div className="landing-stat-value">6<span>+</span></div>
          <div className="landing-stat-label">Programs</div>
        </div>
        <div className="landing-stat">
          <div className="landing-stat-value">20<span>+</span></div>
          <div className="landing-stat-label">Chapters</div>
        </div>
        <div className="landing-stat">
          <div className="landing-stat-value">100<span>%</span></div>
          <div className="landing-stat-label">Free to join</div>
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
            What's included
          </div>
          <h2 className="section-title" style={{ fontSize: '2.5rem', marginTop: '0.75rem' }}>
            Designed for <em>steady progress</em>.
          </h2>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-emoji">🎯</div>
            <h3>Progress at a glance</h3>
            <p>Mark lessons complete and watch your progress update instantly. No guesswork — you always know where you stand.</p>
          </div>
          <div className="feature-card">
            <div className="feature-emoji">🧠</div>
            <h3>Instant quizzes</h3>
            <p>Answer multiple-choice questions and get results right away. Passing scores are set by the instructor.</p>
          </div>
          <div className="feature-card">
            <div className="feature-emoji">🔒</div>
            <h3>Protected content</h3>
            <p>Token auth, right-click protection, and dynamic watermarks help keep course material in the right hands.</p>
          </div>
          <div className="feature-card">
            <div className="feature-emoji">📧</div>
            <h3>Email verification</h3>
            <p>Verify your account with a 6‑digit code sent to your email. It keeps sign-ups and progress trustworthy.</p>
          </div>
          <div className="feature-card">
            <div className="feature-emoji">👩‍🏫</div>
            <h3>Instructor workflow</h3>
            <p>Instructors publish courses, lessons, and quizzes — and can see how learners are moving through the content.</p>
          </div>
          <div className="feature-card">
            <div className="feature-emoji">📱</div>
            <h3>Responsive by default</h3>
            <p>Study on desktop or mobile and pick up where you left off. Same account, same progress.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-final-cta">
        <div className="final-cta-inner">
          <h2>Ready to begin <em>today</em>?</h2>
          <p>Create an account in under a minute — then jump straight into your first lesson.</p>
          <div className="landing-cta">
            <Link to="/signup" className="btn btn-accent" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
              Get started →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div>
          <span className="nav-brand-mark" style={{ marginRight: '0.5rem' }}></span>
          LearnNova
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--ink-softer)' }}>
          Built with Django + React · Learning platform demo
        </div>
      </footer>
    </div>
  )
}
