import React from 'react';

const GlitchButton = ({ children, className = '', as: Tag = 'button', ...props }) => {
  return (
    <Tag
      className={`relative inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold
      overflow-hidden border border-primary-500 text-primary-50 bg-primary-600
      shadow-sm transition-transform duration-150 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500
      ${className}
    `}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 hover:animate-[glitch-scan_0.7s_linear] pointer-events-none" />
      <span className="absolute inset-0 mix-blend-screen opacity-0 hover:opacity-100 hover:animate-[glitch-jitter_0.3s_steps(2,end)_infinite] bg-primary-400/40 pointer-events-none" />
    </Tag>
  );
};

export default GlitchButton;


