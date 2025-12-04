import React from 'react';

const HoverStatCard = ({ children, className = '' }) => {
  return (
    <div
      className={`
        relative rounded-2xl border border-slate-100 bg-white/80 backdrop-blur
        transition-all duration-200 overflow-hidden
        hover:shadow-lg hover:-translate-y-1
        ${className}
      `}
    >
      <div className="absolute inset-0 opacity-0 hover:opacity-100 pointer-events-none">
        <div className="absolute -inset-32 bg-gradient-to-tr from-primary-500/5 via-transparent to-secondary-500/10 animate-[pulse_4s_ease-in-out_infinite]" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default HoverStatCard;


