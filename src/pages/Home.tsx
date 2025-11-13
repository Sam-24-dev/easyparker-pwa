import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useParkings } from '../hooks/useParkings';
import { MapPin, Shield, Clock } from 'lucide-react';

export function Home() {
  const navigate = useNavigate();
  const { totalAvailable } = useParkings();

  return (
    <Layout>
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-primary to-blue-700 text-white rounded-2xl p-8 text-center">
          <h1 className="text-3xl font-bold mb-2">EasyParker</h1>
          <p className="text-blue-100 mb-6">Encuentra y reserva parqueo en menos de 90 segundos</p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/buscar')}
            className="w-full text-primary font-semibold"
          >
            Buscar Parqueo Ahora
          </Button>
        </div>

        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-1">{totalAvailable}</div>
          <p className="text-gray-600">Espacios disponibles hoy en Guayaquil</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Acceso Rápido</h2>
          {[
            { name: 'Urdesa', lat: -2.1769, lng: -79.9016 },
            { name: 'Kennedy', lat: -2.1542, lng: -79.9024 },
            { name: 'Centro', lat: -2.1725, lng: -79.9045 },
          ].map(zone => (
            <Card
              key={zone.name}
              hover
              onClick={() => navigate('/buscar')}
              className="p-4"
            >
              <p className="font-medium text-gray-900">{zone.name}</p>
              <p className="text-sm text-gray-600">Ver parqueos cerca</p>
            </Card>
          ))}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Por qué EasyParker</h2>
          <div className="space-y-3">
            {[
              { icon: MapPin, title: 'Ubicación Precisa', desc: 'Mapa interactivo en tiempo real' },
              { icon: Shield, title: 'Parqueos Verificados', desc: 'Seguridad y confianza garantizada' },
              { icon: Clock, title: 'Reserva Rápida', desc: 'Confirma en segundos' },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="p-4 flex items-start gap-3">
                  <Icon className="text-primary flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-medium text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
