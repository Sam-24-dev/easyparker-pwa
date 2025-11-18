import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Shield, ChevronRight } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();

  const features = [
    {
      icon: MapPin,
      title: 'Encuentra parqueos cerca',
      description: 'Descubre espacios disponibles en tiempo real cerca de tu ubicación',
      color: 'text-indigo',
    },
    {
      icon: Clock,
      title: 'Reserva en segundos',
      description: 'Asegura tu espacio con unos pocos clics y evita dar vueltas',
      color: 'text-purple',
    },
    {
      icon: Shield,
      title: 'Paga de forma segura',
      description: 'Transacciones protegidas y soporte disponible 24/7',
      color: 'text-green-400',
    },
  ];

  return (
    <div className="min-h-screen bg-navy text-white flex flex-col">
      {/* Logo pequeño en la parte superior */}
      <div className="pt-8 px-6 flex justify-center">
        <img
          src="/logo/LOGO EASYPARK-01.png"
          alt="EasyParker"
          className="w-20 h-20 object-contain"
        />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-20">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold mb-3">¡Empecemos!</h1>
          <p className="text-gray-300 text-lg">
            Descubre lo fácil que es encontrar parqueo
          </p>
        </div>

        {/* Features */}
        <div className="space-y-6 animate-slide-up">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-panel rounded-2xl p-5 border border-white/5 hover:bg-panel/80 transition-all shadow-xl"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex items-start space-x-4">
                  <div className={`${feature.color} bg-white/10 p-3 rounded-xl`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                    <p className="text-gray-300 text-sm">{feature.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Botón inferior */}
      <div className="px-6 pb-8">
        <button
          onClick={() => navigate('/signup')}
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-accent/90 text-white font-semibold py-4 rounded-xl flex items-center justify-center space-x-2 shadow-2xl hover:shadow-accent/50 transition-all"
        >
          <span>Crear cuenta</span>
          <ChevronRight className="w-5 h-5" />
        </button>

        <p className="text-center text-gray-400 text-sm mt-4">
          ¿Ya tienes cuenta?{' '}
          <button
            onClick={() => navigate('/signup?mode=login')}
            className="text-primary hover:text-accent font-medium transition-colors"
          >
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
}
