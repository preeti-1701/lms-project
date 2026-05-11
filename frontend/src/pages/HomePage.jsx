import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user } = useAuth();

  // If already logged in, go to dashboard
  if (user) {
    window.location.href = '/dashboard';
    return null;
  }

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🎓</span>
            <span style={styles.logoText}>LMS Platform</span>
          </div>
          <div style={styles.navLinks}>
            <Link to="/login" style={styles.loginBtn}>Login</Link>
            <Link to="/login" style={styles.signupBtn}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContainer}>
          <div style={styles.heroContent}>
            <h1 style={styles.title}>
              Welcome to <br />
              <span style={styles.gradient}>Learning Management System</span>
            </h1>
            <p style={styles.subtitle}>
              A simple and secure platform for online learning. 
              Access courses, track progress, and earn certificates.
            </p>
            <div style={styles.buttonGroup}>
              <Link to="/login" style={styles.primaryBtn}>
                Get Started →
              </Link>
            </div>
            <div style={styles.stats}>
              <div style={styles.statItem}>
                <h3>3+</h3>
                <p>Courses</p>
              </div>
              <div style={styles.statItem}>
                <h3>50+</h3>
                <p>Students</p>
              </div>
              <div style={styles.statItem}>
                <h3>100%</h3>
                <p>Secure</p>
              </div>
            </div>
          </div>
          <div style={styles.heroImage}>
            <div style={styles.imageBox}>
              <div style={styles.imageIcon}>📚</div>
              <p>Learn Anywhere, Anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.features}>
        <div style={styles.sectionContainer}>
          <h2 style={styles.sectionTitle}>Key Features</h2>
          <div style={styles.featuresGrid}>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>📹</div>
              <h3>Video Courses</h3>
              <p>Access high-quality video content from expert instructors</p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>🔒</div>
              <h3>Secure Platform</h3>
              <p>Protected content with watermarks and security features</p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>📊</div>
              <h3>Track Progress</h3>
              <p>Monitor your learning journey and achievements</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContainer}>
          <p>© 2024 LMS Platform. All rights reserved.</p>
          <p style={styles.footerText}>Secure Learning Management System</p>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: '#f5f7fb',
  },
  navbar: {
    padding: '20px 0',
    background: 'white',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  logoIcon: {
    fontSize: '28px',
  },
  logoText: {
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  navLinks: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
  },
  loginBtn: {
    textDecoration: 'none',
    color: '#4f46e5',
    fontWeight: '500',
    padding: '8px 16px',
  },
  signupBtn: {
    padding: '8px 24px',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '30px',
    fontWeight: '500',
  },
  hero: {
    padding: '80px 0',
  },
  heroContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    alignItems: 'center',
    gap: '50px',
  },
  heroContent: {
    textAlign: 'left',
  },
  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#1e293b',
    lineHeight: '1.2',
  },
  gradient: {
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '18px',
    color: '#64748b',
    lineHeight: '1.6',
    marginBottom: '30px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    marginBottom: '40px',
  },
  primaryBtn: {
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '30px',
    fontWeight: '500',
    display: 'inline-block',
  },
  stats: {
    display: 'flex',
    gap: '40px',
  },
  statItem: {
    textAlign: 'center',
  },
  heroImage: {
    display: 'flex',
    justifyContent: 'center',
  },
  imageBox: {
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    padding: '60px',
    borderRadius: '30px',
    textAlign: 'center',
    color: 'white',
    boxShadow: '0 20px 40px rgba(79,70,229,0.2)',
  },
  imageIcon: {
    fontSize: '80px',
    marginBottom: '20px',
  },
  features: {
    padding: '80px 0',
    background: 'white',
  },
  sectionContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '50px',
    color: '#1e293b',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
  },
  featureCard: {
    padding: '30px',
    background: '#f8fafc',
    borderRadius: '20px',
    transition: 'transform 0.3s',
  },
  featureIcon: {
    fontSize: '48px',
    marginBottom: '15px',
  },
  footer: {
    padding: '40px 0',
    background: '#1e293b',
    color: '#94a3b8',
    textAlign: 'center',
  },
  footerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  footerText: {
    fontSize: '12px',
    marginTop: '10px',
  },
};

export default HomePage;