import React from 'react';

export function LoadingSpinner({ text = 'Loading analytics data...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-14 h-14 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative">
        <div className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-cyan-500/20 border-t-cyan-400 animate-spin shadow-glow-cyan`} />
        <div className="absolute inset-0 rounded-full border-cyan-400/40 animate-ping opacity-30" />
      </div>
      {text && <p className="text-sm font-medium text-gray-400 animate-pulse">{text}</p>}
    </div>
  );
}

export function Badge({ children, variant = 'cyan', size = 'sm', className = '' }) {
  const variants = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-glow-cyan/20',
    blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
    gray: 'bg-gray-800 text-gray-300 border border-gray-700',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs font-semibold',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${variants[variant] || variants.cyan} ${sizes[size] || sizes.sm} ${className}`}>
      {children}
    </span>
  );
}

export default LoadingSpinner;
