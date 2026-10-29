import React from 'react';

export default function GlassCard({ children, className = '', hover = true, id }) {
  return (
    <div
      id={id}
      className={`glass-panel rounded-2xl p-5 md:p-6 transition-all duration-300 ${
        hover ? 'glass-panel-hover' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
