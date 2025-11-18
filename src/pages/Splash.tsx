import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir después de 4 segundos
    const timer = setTimeout(() => {
      navigate('/onboarding');
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-6">
      {/* Logo principal con animación */}
      <div className="animate-fade-in">
        <img
          src="/logo/LOGO EASYPARK-01.png"
          alt="EasyParker Logo"
          className="w-48 h-48 object-contain animate-bounce-slow"
        />
      </div>

      {/* Texto debajo del logo */}
      <div className="mt-8 animate-slide-up">
        <p className="text-gray-300 text-center text-xl font-medium">
          Estaciona fácil, vive sin estrés
        </p>
      </div>

      {/* Indicador de carga */}
      <div className="mt-12 flex space-x-2">
        <div className="w-2 h-2 bg-indigo rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-indigo rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-indigo rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}
