import React from 'react';

const StatsCard = ({ title, value, icon, color, onClick, trend }) => {
  return (
    <div 
      onClick={onClick}
      className={`p-7 bg-white border border-slate-100 rounded-[2rem] shadow-soft transition-all duration-300 ease-in-out group ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1.5 hover:scale-[1.02]' : 'hover:shadow-md hover:-translate-y-1'
      }`}
    >
      <div className="flex items-center justify-between mb-5">
        <div className={`w-14 h-14 ${color || 'bg-primary-50 text-primary-600'} rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
          </svg>
        </div>
        {trend && (
          <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider transition-all duration-300 group-hover:scale-105 ${
            trend.includes('+') 
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
              : 'bg-slate-50 text-slate-500 border border-slate-100'
          }`}>
            {trend}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] transition-colors group-hover:text-slate-500">{title}</p>
        <p className="text-4xl font-black text-slate-900 tracking-tight group-hover:text-primary-700 transition-colors">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
