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
      
      {/* Content Container */}
      <div className={`relative z-10 ${variant === 'marketing' ? 'block' : 'h-screen flex flex-col'}`}>
        {children}
      </div>
    </div>
  );
}
