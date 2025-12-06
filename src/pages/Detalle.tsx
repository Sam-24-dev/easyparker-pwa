import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StarRating } from '../components/ui/StarRating';
import { ReviewList } from '../components/reviews/ReviewList';
import { useParkingContext } from '../context/ParkingContext';
import { getReviewsByParkingId } from '../data/reviews';
import { FavoriteButton } from '../components/ui/FavoriteButton';
import {
  MapPin,
  Clock,
  ShieldCheck,
  Camera,
  Accessibility,
  Star,
  Zap,
  ExternalLink,
  CheckCircle
} from 'lucide-react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

export function Detalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getParkingById } = useParkingContext();

  const parking = getParkingById(Number(id));

  // Todos los hooks deben estar antes de cualquier return condicional
  const reviews = useMemo(() => {
    if (!parking) return [];
    return getReviewsByParkingId(parking.verificado);
  }, [parking]);

  const [availability, setAvailability] = useState(parking?.plazasLibres ?? 0);
  const [lastUpdateAt, setLastUpdateAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (parking) {
      setAvailability(parking.plazasLibres);
    }
  }, [parking]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAvailability((prev) => {
        const variation = Math.floor(Math.random() * 5) - 2;
        const next = Math.max(0, Math.min(prev + variation, 60));
        if (next !== prev) {
          setLastUpdateAt(Date.now());
        }
        return next;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const secondsSinceUpdate = Math.max(0, Math.floor((now - lastUpdateAt) / 1000));

  const availabilityInfo = useMemo(() => {
    if (availability <= 0) {
      return {
        label: 'Sin plazas ahora mismo',
        badgeClass: 'bg-red-100 text-red-700 ring-red-200',
        dot: 'bg-red-500',
      };
    }
    if (availability < 3) {
      return {
        label: `¡APRESÚRATE! Solo ${availability} plaza${availability === 1 ? '' : 's'}`,
        badgeClass: 'bg-red-100 text-red-700 ring-red-200',
        dot: 'bg-red-500',
      };
    }
    if (availability > 10) {
      return {
        label: 'Amplia disponibilidad',
        badgeClass: 'bg-green-100 text-green-700 ring-green-200',
        dot: 'bg-green-500',
      };
    }
    return {
      label: `${availability} plazas disponibles`,
      badgeClass: 'bg-amber-100 text-amber-700 ring-amber-200',
      dot: 'bg-amber-500',
    };
  }, [availability]);

  const featureItems = useMemo(
    () => {
      if (!parking) return [];
      return [
        {
          label: 'Seguridad 24/7',
          icon: ShieldCheck,
          active: parking.seguridad.some((seg) => seg.toLowerCase().includes('guardia')),
          tooltip: 'Personal o guardia en sitio',
        },
        {
          label: 'Cámaras activas',
          icon: Camera,
          active: parking.seguridad.some((seg) => seg.toLowerCase().includes('cámara')),
          tooltip: 'Zona monitoreada con CCTV',
        },
        {
          label: 'Acceso PMR',
          icon: Accessibility,
          active: parking.accesiblePMR,
          tooltip: 'Espacios adaptados para movilidad reducida',
        },
        {
          label: 'Zona techada',
          icon: Star,
          active: parking.seguridad.some((seg) => seg.toLowerCase().includes('techo')),
          tooltip: 'Protección contra lluvia y sol',
        },
        {
          label: 'Pago digital',
          icon: Zap,
          active: true,
          tooltip: 'Acepta reservas y pagos desde la app',
        },
      ];
    },
    [parking]
  );

  const mapIcon = useMemo(
    () =>
      L.divIcon({
        html: '<span style="width:16px;height:16px;display:block;background:#0B1F60;border-radius:9999px;border:4px solid #fff;box-shadow:0 8px 24px rgba(15,23,42,0.3);"></span>',
        className: 'detail-marker-icon',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      }),
    []
  );

  // Early return DESPUÉS de todos los hooks
  if (!parking) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Parqueo no encontrado</p>
          <Button onClick={() => navigate('/buscar')}>Volver a Búsqueda</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 pb-24">
        <section className="space-y-4">
          {/* Imagen única sin galería ni navegación */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-100 h-64">
            <img 
              src={parking.foto} 
              alt={parking.nombre} 
              loading="lazy" 
              className="w-full h-full object-cover bg-slate-200" 
            />
            {parking.verificado && (
              <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                ✓ Verificado
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-[0.3em]">Buscar un estacionamiento</p>
              <h1 className="text-3xl font-semibold text-slate-900 mt-1">{parking.nombre}</h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <FavoriteButton parkingId={parking.id} size="md" />
              {parking.zonaValidada && (
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Zona Validada
                </div>
              )}
              {parking.verificado && <Badge variant="success">VERIFICADO</Badge>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StarRating rating={parking.calificacion} size="md" />
            <span className="text-lg font-semibold text-gray-900">{parking.calificacion.toFixed(1)}</span>
            <span className="text-sm text-slate-500">{parking.tipo.replace('_', ' ')}</span>
          </div>

          <div className="rounded-3xl border border-slate-100 p-4 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Tarifa por hora</p>
                <p className="text-3xl font-semibold text-primary">${parking.precio.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin size={18} />
                  <span>{parking.distancia}m</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 mt-1">
                  <Clock size={18} />
                  <span>{parking.horario}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-blue-50 p-5 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Disponibilidad en vivo</p>
              <p className="text-4xl font-semibold text-slate-900">{availability}</p>
            </div>
            <div
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ${availabilityInfo.badgeClass}`}
            >
              <span className={`w-2 h-2 rounded-full ${availabilityInfo.dot} animate-pulse`} />
              {availabilityInfo.label}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Actualizado hace {secondsSinceUpdate}s</span>
            <span className="font-medium text-primary">Se refresca cada 8s automáticamente</span>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Ubicación</h2>
          <div className="rounded-2xl overflow-hidden border border-slate-100" style={{ height: 200 }}>
            <MapContainer
              center={[parking.lat, parking.lng]}
              zoom={16}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
              key={`${parking.lat}-${parking.lng}`}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <Marker position={[parking.lat, parking.lng]} icon={mapIcon} />
            </MapContainer>
          </div>
          <Button
            variant="secondary"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${parking.lat},${parking.lng}`, '_blank')}
          >
            Ver en Google Maps
            <ExternalLink size={16} />
          </Button>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Características</h2>
          <div className="grid grid-cols-2 gap-3">
            {featureItems.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.label}
                  className={`rounded-2xl border px-4 py-3 flex items-center gap-3 transition ${
                    feature.active ? 'border-primary/40 bg-primary/5 text-primary' : 'border-slate-200 text-slate-500'
                  }`}
                  title={feature.tooltip}
                >
                  <span className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${feature.active ? 'bg-white' : 'bg-slate-100'}`}>
                    <Icon size={26} />
                  </span>
                  <span className="text-sm font-semibold">{feature.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Opiniones reales</h2>
            {parking.accesiblePMR && (
              <Badge variant="success" size="md">
                Accesible PMR
              </Badge>
            )}
          </div>
          <ReviewList reviews={reviews} maxDisplay={3} />
        </section>

        <Button
          size="lg"
          onClick={() => navigate(`/reservar/${parking.id}`)}
          className="w-full"
        >
          Reservar ahora
        </Button>
      </div>
    </Layout>
  );
}
