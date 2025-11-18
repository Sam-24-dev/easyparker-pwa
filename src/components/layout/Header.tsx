import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-panel border-b border-white/10 z-40 shadow-lg">
      <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/home" className="flex items-center gap-2 font-semibold text-lg text-white">
          <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center text-lg">
            P
          </div>
          <span>EasyParker</span>
        </Link>
        <div className="flex items-center gap-4">
          <MapPin size={20} className="text-primary" />
          <Link
            to="/mis-reservas"
            className="text-sm font-medium text-primary hover:text-accent transition-colors"
          >
            Mis Reservas
          </Link>
        </div>
      </div>
    </header>
  );
}
