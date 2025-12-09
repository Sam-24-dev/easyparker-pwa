import React from 'react';
import { HostBottomNav } from './HostBottomNav';

interface HostLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export function HostLayout({ children, showNav = true }: HostLayoutProps) {
  return (
    <div className="min-h-[100dvh] bg-emerald-900 text-slate-900">
      <div className="max-w-md mx-auto min-h-[100dvh] flex flex-col shadow-2xl bg-slate-50 overflow-y-auto">
        <main className={`flex-1 px-4 sm:px-5 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-in fade-in overflow-y-auto ${showNav ? 'pb-24 sm:pb-28' : 'pb-4 sm:pb-6'}`}>
          {children}
        </main>
        
        {showNav && <HostBottomNav />}
      </div>
    </div>
  );
}
