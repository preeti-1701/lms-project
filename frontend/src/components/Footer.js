import React from 'react';

function Footer() {
  return (
    <footer className="relative z-10 bg-slate-900/60 backdrop-blur-xl border-t border-white/10 px-6 md:px-12 py-12 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                SecureLearn
              </span>
            </h3>
            <p className="text-slate-400 text-sm">
              A modern, secure learning management system designed for educators and students.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/login" className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Login
                </a>
              </li>
              <li>
                <a href="/about" className="text-slate-400 hover:text-cyan-400 transition-colors">
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Support</h3>
            <p className="text-slate-400 text-sm mb-2">
              Have questions? We're here to help.
            </p>
            <p className="text-cyan-400 font-medium text-sm">
              support@securelearn.com
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8">
          <div className="text-center text-slate-400 text-sm space-y-2">
            <p>© 2026 SecureLearn LMS. All rights reserved.</p>
            <p>
              Secure Learning Platform Developed By @NagarajHulmani
              {/* <span className="text-cyan-400">❤️</span> */}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;