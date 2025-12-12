import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, BookmarkCheck, User, MessageSquare } from 'lucide-react';
import { useReservaContext } from '../../context/ReservaContext';
import { useChatContext } from '../../context/ChatContext';

const navItems = [
  { to: '/home', label: 'Inicio', icon: Home },
  { to: '/buscar', label: 'Buscar', icon: Search },
  { to: '/mensajes', label: 'Mensajes', icon: MessageSquare },
  { to: '/mis-reservas', label: 'Reservas', icon: BookmarkCheck },
  { to: '/perfil', label: 'Perfil', icon: User },
];

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { getReservasActivas } = useReservaContext();
  const { getTotalUnreadCount } = useChatContext();
  const activeReservations = getReservasActivas().length;
  const unreadMessages = getTotalUnreadCount();

  const isActive = (to: string) => {
    if (to === '/buscar') {
      return pathname === '/buscar' || pathname.startsWith('/parqueo') || pathname.startsWith('/reservar');
    }
    if (to === '/mensajes') {
      return pathname === '/mensajes' || pathname.startsWith('/mensajes/');
    }
    return pathname === to;
  };

  const handleNavClick = (to: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(to, { replace: false });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#050B2C] to-[#101F6B] border-t border-white/10 shadow-[0_-8px_30px_rgba(3,7,18,0.45)] z-[9999] pb-safe">
      <div className="max-w-md mx-auto px-2 sm:px-4 py-2.5 flex items-center justify-between">
        {navItems.map(({ to, label, icon: Icon }) => {
          const showReservaBadge = to === '/mis-reservas' && activeReservations > 0;
          const showMessageBadge = to === '/mensajes' && unreadMessages > 0;
          return (
            <button
              key={to}
              type="button"
              onClick={() => handleNavClick(to)}
              className={`relative flex flex-col items-center gap-1 text-xs font-semibold transition-all ${isActive(to)
                ? 'text-white'
                : 'text-white/60 hover:text-white/80'
                }`}
            >
              <span
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl ${isActive(to) ? 'bg-white/15 backdrop-blur text-white shadow-inner' : ''
                  }`}
              >
                <div className="relative">
                  <Icon size={20} />
                  {showReservaBadge && (
                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center px-1">
                      {Math.min(activeReservations, 9)}
                    </span>
                  )}
                  {showMessageBadge && (
                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] rounded-full bg-emerald-500 text-[10px] font-bold text-white flex items-center justify-center px-1">
                      {Math.min(unreadMessages, 9)}
                    </span>
                  )}
                </div>
                <span className="text-[10px]">{label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

