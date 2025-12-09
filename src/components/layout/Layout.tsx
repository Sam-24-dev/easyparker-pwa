import React from 'react';
import { BottomNav } from './BottomNav';
import { DemoBanner } from '../ui/DemoBanner';
import { ConnectionStatus } from '../ui/ConnectionStatus';

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
  backgroundClassName?: string;
}

export function Layout({ children, showNav = false, backgroundClassName = 'bg-[#0A1F63]' }: LayoutProps) {
  return (
    <div className={`min-h-[100dvh] ${backgroundClassName} text-navy`}>
      <div className="max-w-md mx-auto min-h-[100dvh] flex flex-col shadow-2xl bg-white overflow-y-auto">
        <DemoBanner />
        <ConnectionStatus />
        <main className={`flex-1 px-4 sm:px-5 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-in fade-in overflow-y-auto ${showNav ? 'pb-28 sm:pb-32' : 'pb-8 sm:pb-12'}`}>
          {children}
        </main>
      </div>
      {showNav && <BottomNav />}
    </div>
  );
}
