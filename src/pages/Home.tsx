import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { useParkings } from '../hooks/useParkings';
import { useAuth } from '../context/AuthContext';
import { Search, Compass, Megaphone, Calendar } from 'lucide-react';

export function Home() {
  const navigate = useNavigate();
  const { parkings } = useParkings();
  const { user } = useAuth();

  const suggestions = [
    { label: 'Explorar', icon: Compass },
    { label: 'Anuncios', icon: Megaphone },
    { label: 'Reservas', icon: Calendar },
  ];

  const previousReservations = parkings.slice(0, 2);

  return (
    <Layout showNav>
      <section className="bg-gradient-to-b from-[#0B1F60] to-[#132A74] rounded-3xl text-white p-6 shadow-xl">
        <p className="text-sm text-white/70">Hola {user?.nombre?.split(' ')[0] || 'Mirka'}!</p>
        <h1 className="text-2xl font-semibold mt-1 mb-6 leading-snug">
          ¿Quieres buscar estacionamiento?
        </h1>

        <button
          onClick={() => navigate('/buscar')}
          className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3 text-white/80"
        >
          <Search size={18} />
          Buscar parqueo cercano
        </button>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[#0B1F60]">Sugerencias</h2>
          <button className="text-sm text-[#5A63F2] font-semibold">Ver todo</button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {suggestions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col items-center justify-center py-4 gap-2 text-[#0B1F60]"
            >
              <Icon size={22} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#0B1F60] mb-3">Reservas anteriores</h2>
        <div className="space-y-3">
          {previousReservations.map((parking) => (
            <button
              key={parking.id}
              onClick={() => navigate(`/detalle/${parking.id}`)}
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 flex items-center justify-between text-left shadow-sm bg-white"
            >
              <div>
                <p className="font-semibold text-[#0B1F60]">{parking.nombre}</p>
                <span className="text-sm text-slate-500 capitalize">{parking.tipo.replace('_', ' ')}</span>
              </div>
              <span className="text-[#5A63F2] text-sm font-medium">Ver</span>
            </button>
          ))}
        </div>
      </section>
    </Layout>
  );
}
