import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Home() {
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent opacity-30 pointer-events-none" />

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative z-10 px-6 md:px-4 py-8 md:py-20 mb-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                Learn Anytime, Anywhere
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-300">
              Secure LMS platform designed for students and trainers
            </p>
          </div>

          <div className="mt-20">
            <Link to="/login">
              <button className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 text-lg">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 md:px-12 py-16 md:py-24 mb-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                Platform Features
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Everything you need for effective online learning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 - Secure Access */}
            <div className="group relative bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 hover:border-cyan-400/30 hover:bg-slate-900/60 transition-all duration-300">
              {/* Gradient background accent */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/10 to-blue-400/10 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-lg mb-6 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Secure Access</h3>
                <p className="text-slate-400 leading-relaxed">
                  Role-based protected learning environment with enterprise-grade security.
                </p>
              </div>
            </div>

            {/* Feature 2 - Track Progress */}
            <div className="group relative bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 hover:border-cyan-400/30 hover:bg-slate-900/60 transition-all duration-300">
              {/* Gradient background accent */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/10 to-blue-400/10 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-lg mb-6 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Track Progress</h3>
                <p className="text-slate-400 leading-relaxed">
                  Monitor student learning outcomes and performance analytics in real-time.
                </p>
              </div>
            </div>

            {/* Feature 3 - Interactive Courses */}
            <div className="group relative bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 hover:border-cyan-400/30 hover:bg-slate-900/60 transition-all duration-300">
              {/* Gradient background accent */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/10 to-blue-400/10 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-lg mb-6 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM4 9h12v-1H4v1z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Interactive Courses</h3>
                <p className="text-slate-400 leading-relaxed">
                  Access engaging video content, quizzes, and assignments in one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative z-10 px-6 md:px-12 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-12 md:p-16 text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to Start Learning?</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Join thousands of students and trainers on our secure learning platform and unlock your potential.
            </p>
            <Link to="/login">
              <button className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300">
                Login Now
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>

    
  );
}

export default Home;