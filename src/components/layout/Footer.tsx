import { AppLogo } from '../ui/AppLogo';

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-panel border-t border-white/10 py-4">
      <div className="max-w-md mx-auto px-4 text-center text-sm text-gray-400">
        <div className="mb-2 flex justify-center">
          <AppLogo className="h-6 w-auto" />
        </div>
        <p className="text-xs">Encuentra y reserva parqueo al instante</p>
      </div>
    </footer>
  );
}
