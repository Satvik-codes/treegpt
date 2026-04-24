import React from 'react';

type SiteShellProps = {
  children: React.ReactNode;
  variant?: 'marketing' | 'app';
  className?: string;
};

export default function SiteShell({ children, variant = 'app', className = '' }: SiteShellProps) {
  return (
    <div className={`relative min-h-screen bg-[var(--surface)] text-[var(--on_surface)] font-sans ${className}`}>
      {/* Global Grain Effect */}
      <div className="grain" />
      
      {/* Ambient gradient layer */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <svg width="100%" height="100%" viewBox="0 0 1400 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
          <radialGradient id="shellGrad" cx="50%" cy="0%" r="70%">
            <stop offset="0%" stopColor="var(--amber)" stopOpacity={variant === 'marketing' ? "0.08" : "0.03"} />
            <stop offset="100%" stopColor="var(--amber)" stopOpacity="0" />
          </radialGradient>
          <rect width="100%" height="100%" fill="url(#shellGrad)" />
        </svg>
      </div>

      {/* Content Container */}
      <div className={`relative z-10 ${variant === 'marketing' ? 'block' : 'h-screen flex flex-col'}`}>
        {children}
      </div>
    </div>
  );
}
