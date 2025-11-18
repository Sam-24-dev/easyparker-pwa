import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-navy">
      <Header />
      <main className="pt-16 pb-20 px-4 max-w-md mx-auto animate-in fade-in">
        {children}
      </main>
      <Footer />
    </div>
  );
}
