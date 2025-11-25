import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { useParkingContext } from '../context/ParkingContext';
import { useAuth } from '../context/AuthContext';
import { Search, Compass, Megaphone, Calendar, LogOut } from 'lucide-react';

const suggestionCards = [
  { label: 'Explorar', icon: Compass },
  { label: 'Anuncios', icon: Megaphone },
  { label: 'Reservas', icon: Calendar },
];

export function Home() {
  const navigate = useNavigate();
  const { parkings: allParkings } = useParkingContext(); // Datos SIN filtrar
  const { user, logout } = useAuth();

  const firstName = user?.nombre?.split(' ')[0] || 'Mirka';
  const previousReservations = allParkings.slice(0, 3); // Siempre muestra los primeros 3

  const handleLogout = () => {
    logout();
    navigate('/signup?mode=login');
  };

  return (
    <Layout showNav backgroundClassName="bg-gradient-to-b from-[#081750] to-[#0B1F60]">
      <div className="space-y-5">
        <section className="rounded-3xl bg-gradient-to-br from-[#0A1F63] to-[#132A74] text-white p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-white/70">Hola {firstName}!</p>
              <h1 className="text-2xl font-semibold mt-1 leading-snug">
                ¿Quieres buscar estacionamiento?
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/20 transition"
            >
              <LogOut size={14} />
              Salir
            </button>
          </div>

          <button
            onClick={() => navigate('/buscar')}
            className="mt-6 w-full bg-white rounded-2xl px-5 py-3 flex items-center gap-3 text-[#0B1F60] font-semibold shadow-lg"
          >
            <Search size={18} />
            Buscar parqueo cercano
          </button>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-lg space-y-5">
          <article className="rounded-2xl bg-gradient-to-b from-[#0C1F63] to-[#1C2F74] text-white p-5 relative overflow-hidden">
            <p className="text-sm text-white/70">Zona activa</p>
            <h2 className="text-xl font-semibold">Urdesa Central</h2>
            <div className="mt-4 h-28 rounded-2xl bg-[#09123F] border border-white/10 grid grid-cols-3 grid-rows-2 gap-2 p-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-white/10 border border-white/15"
                  aria-hidden
                />
              ))}
            </div>
            <button
              onClick={() => navigate('/buscar')}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white/90"
            >
              Ver mapa completo
            </button>
          </article>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-[#0B1F60]">Sugerencias</h3>
              <button className="text-sm text-[#5A63F2] font-semibold">Ver todo</button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {suggestionCards.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  className="rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col items-center justify-center py-4 gap-2 text-[#0B1F60] shadow-sm"
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#0B1F60]">Reservas anteriores</h3>
            <button className="text-sm text-[#5A63F2] font-semibold">Ver historial</button>
          </div>

          <div className="space-y-3">
            {previousReservations.map((parking) => (
              <button
                key={parking.id}
                onClick={() => navigate(`/parqueo/${parking.id}`)}
                className="w-full rounded-2xl border border-slate-100 px-4 py-3 flex items-center justify-between text-left bg-[#F7F8FF]"
              >
                <div>
                  <p className="font-semibold text-[#0B1F60]">{parking.nombre}</p>
                  <p className="text-xs text-slate-500">
                    {parking.tipo === 'calle' ? 'Zona pública' : 'Urdesa, Guayaquil'}
                  </p>
                </div>
                <span className="text-[#5A63F2] text-sm font-semibold">Ver</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
