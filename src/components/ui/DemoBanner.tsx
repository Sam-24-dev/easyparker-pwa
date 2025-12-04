import { Info, X } from 'lucide-react';
import { useState } from 'react';

export function DemoBanner() {
  const [visible, setVisible] = useState(() => {
    return localStorage.getItem('demoBannerClosed') !== 'true';
  });

  const handleClose = () => {
    localStorage.setItem('demoBannerClosed', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg relative mb-4">
      <div className="flex items-start">
        <Info className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-800">
            Modo Demo - Validación en Curso
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            La disponibilidad de parqueos es simulada para fines de prueba. 
            Los datos en tiempo real estarán disponibles próximamente.
          </p>
        </div>
        <button
          onClick={handleClose}
          className="ml-3 text-yellow-600 hover:text-yellow-800 transition"
          aria-label="Cerrar banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
