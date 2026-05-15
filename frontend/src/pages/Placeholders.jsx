import React from 'react';

const PlaceholderPage = ({ title, icon }) => (
  <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm text-center animate-fade-in">
    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
      {icon}
    </div>
    <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{title}</h1>
    <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
      We're working hard to bring you the best {title.toLowerCase()} experience. 
      This feature will be available in the next major update!
    </p>
    <button className="mt-8 btn-primary">
      Go back to Dashboard
    </button>
  </div>
);

export const Notifications = () => <PlaceholderPage title="Notifications" icon="🔔" />;
