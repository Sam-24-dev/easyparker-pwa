import { Home, Car, Wallet, MessageSquare } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useChatContext } from '../../context/ChatContext';

export function HostBottomNav() {
  const location = useLocation();
  const { getTotalUnreadCount } = useChatContext();
  const unreadMessages = getTotalUnreadCount();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-50 max-w-md mx-auto">
      <div className="flex justify-around items-center h-16 px-2">
        <Link
          to="/host/dashboard"
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive('/host/dashboard') ? 'text-emerald-700' : 'text-slate-400'
            }`}
        >
          <Home size={24} strokeWidth={isActive('/host/dashboard') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Inicio</span>
        </Link>

        <Link
          to="/host/garage"
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive('/host/garage') ? 'text-emerald-700' : 'text-slate-400'
            }`}
        >
          <Car size={24} strokeWidth={isActive('/host/garage') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Mi Garaje</span>
        </Link>

        <Link
          to="/host/mensajes"
          className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive('/host/mensajes') ? 'text-emerald-700' : 'text-slate-400'
            }`}
        >
          <div className="relative">
            <MessageSquare size={24} strokeWidth={isActive('/host/mensajes') ? 2.5 : 2} />
            {unreadMessages > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] rounded-full bg-emerald-500 text-[10px] font-bold text-white flex items-center justify-center px-1">
                {Math.min(unreadMessages, 9)}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Mensajes</span>
        </Link>

        <Link
          to="/host/wallet"
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive('/host/wallet') ? 'text-emerald-700' : 'text-slate-400'
            }`}
        >
          <Wallet size={24} strokeWidth={isActive('/host/wallet') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Billetera</span>
        </Link>
      </div>
    </nav>
  );
}

