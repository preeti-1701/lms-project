import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-grow p-8 overflow-y-auto max-h-screen custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          <Header />
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
