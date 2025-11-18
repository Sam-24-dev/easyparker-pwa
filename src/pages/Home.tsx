import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useParkings } from '../hooks/useParkings';
import { useAuth } from '../context/AuthContext';
import { MapPin, Shield, Clock, LogOut } from 'lucide-react';

export function Home() {
  const navigate = useNavigate();
  const { totalAvailable } = useParkings();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header con usuario */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user?.avatar && (
              <img src={user.avatar} alt={user.nombre} className="w-12 h-12 rounded-full ring-2 ring-primary/50" />
            )}
            <div>
              <p className="text-sm text-gray-400">Hola,</p>
              <p className="font-semibold text-white">{user?.nombre || 'Usuario'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={20} />
          </button>
        </div>

        <div className="bg-gradient-to-br from-primary via-accent to-purple-600 text-white rounded-2xl p-8 text-center shadow-2xl">
          <h1 className="text-3xl font-bold mb-2">EasyParker</h1>
          <p className="text-white/90 mb-6">Encuentra y reserva parqueo en menos de 90 segundos</p>
          <button
            onClick={() => navigate('/buscar')}
            className="w-full bg-white text-primary hover:bg-white/90 font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Buscar Parqueo Ahora
          </button>
        </div>

        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-1">{totalAvailable}</div>
          <p className="text-gray-300">Espacios disponibles hoy en Guayaquil</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Acceso Rápido</h2>
          {[
            { name: 'Urdesa', lat: -2.1769, lng: -79.9016 },
            { name: 'Kennedy', lat: -2.1542, lng: -79.9024 },
            { name: 'Centro', lat: -2.1725, lng: -79.9045 },
          ].map(zone => (
            <div
              key={zone.name}
              onClick={() => navigate('/buscar')}
              className="bg-panel rounded-xl p-4 border border-white/10 hover:bg-panel/80 transition-all cursor-pointer"
            >
              <p className="font-medium text-white">{zone.name}</p>
              <p className="text-sm text-gray-400">Ver parqueos cerca</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Por qué EasyParker</h2>
          <div className="space-y-3">
            {[
              { icon: MapPin, title: 'Ubicación Precisa', desc: 'Mapa interactivo en tiempo real' },
              { icon: Shield, title: 'Parqueos Verificados', desc: 'Seguridad y confianza garantizada' },
              { icon: Clock, title: 'Reserva Rápida', desc: 'Confirma en segundos' },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="bg-panel rounded-xl p-4 border border-white/10 flex items-start gap-3">
                  <Icon className="text-primary flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-medium text-white">{feature.title}</h3>
                    <p className="text-sm text-gray-400">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
