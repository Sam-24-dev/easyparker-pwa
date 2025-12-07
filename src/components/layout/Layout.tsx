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
    <div className={`min-h-screen ${backgroundClassName} text-navy`}>
      <div className="max-w-md mx-auto min-h-screen flex flex-col shadow-2xl bg-white">
        <DemoBanner />
        <ConnectionStatus />
        <main className={`flex-1 px-5 py-6 space-y-6 animate-in fade-in ${showNav ? 'pb-32' : 'pb-12'}`}>
          {children}
        </main>
      </div>
      {showNav && <BottomNav />}
    </div>
  );
}
