import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Home() {
  return (
    <div>

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section
        style={{
          padding: '80px 40px',
          textAlign: 'center'
        }}
      >
        <h1>Learn Anytime, Anywhere</h1>

        <p>Secure LMS for Students and Trainers</p>

        <div style={{ marginTop: '25px' }}>
          <Link to="/login">
            <button>
              Login
            </button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section
        style={{
          padding: '40px'
        }}
      >
        <h2>Platform Features</h2>

        <div
          style={{
            display: 'flex',
            gap: '20px',
            marginTop: '30px',
            flexWrap: 'wrap'
          }}
        >

          {/* Feature 1 */}
          <div
            style={{
              border: '1px solid #ddd',
              padding: '20px',
              flex: '1'
            }}
          >
            <h3>Secure Access</h3>
            <p>Role based protected learning.</p>
          </div>

          {/* Feature 2 */}
          <div
            style={{
              border: '1px solid #ddd',
              padding: '20px',
              flex: '1'
            }}
          >
            <h3>Track Progress</h3>
            <p>Monitor student learning and performance.</p>
          </div>

          {/* Feature 3 */}
          <div
            style={{
              border: '1px solid #ddd',
              padding: '20px',
              flex: '1'
            }}
          >
            <h3>Interactive Courses</h3>
            <p>Access videos, quizzes and assignments.</p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default Home;