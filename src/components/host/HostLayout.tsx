import React from 'react';
import { HostBottomNav } from './HostBottomNav';

interface HostLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export function HostLayout({ children, showNav = true }: HostLayoutProps) {
  return (
    <div className="min-h-screen bg-emerald-900 text-slate-900">
      <div className="max-w-md mx-auto min-h-screen flex flex-col shadow-2xl bg-slate-50">
        <main className={`flex-1 px-5 py-6 space-y-6 animate-in fade-in ${showNav ? 'pb-24' : 'pb-6'}`}>
          {children}
        </main>
        
        {showNav && <HostBottomNav />}
      </div>
    </div>
  );
}
