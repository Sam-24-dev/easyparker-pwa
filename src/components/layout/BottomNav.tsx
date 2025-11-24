import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, BookmarkCheck } from 'lucide-react';

const navItems = [
  { to: '/home', label: 'Inicio', icon: Home },
  { to: '/buscar', label: 'Buscar', icon: Search },
  { to: '/mis-reservas', label: 'Reservas', icon: BookmarkCheck },
];

export function BottomNav() {
  return (
    <nav className="border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="max-w-md mx-auto px-6 py-3 flex items-center justify-between">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-slate-400'
              }`
            }
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
