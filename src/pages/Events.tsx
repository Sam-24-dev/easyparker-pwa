import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { events } from '../data/events';
import { MapPin, Clock, ArrowLeft, Navigation } from 'lucide-react';

export function Events() {
    const navigate = useNavigate();

    const handleFindParking = (eventId: string) => {
        // Navegar a Buscar pasando el ID del evento como estado
        navigate('/buscar', { state: { activeEventId: eventId } });
    };

    return (
        <Layout showNav={false} backgroundClassName="bg-[#0B1F60] min-h-screen">
            <div className="p-4 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold text-white">Eventos Destacados</h1>
                </div>

                {/* Lista de Eventos */}
                <div className="space-y-6">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="bg-white rounded-3xl overflow-hidden shadow-xl border-2 border-[#0B1F60]/10 hover:border-[#0B1F60] transition-all duration-300 transform hover:-translate-y-1 relative"
                        >
                            {/* Imagen Grande */}
                            <div className="relative h-48">
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F60] via-[#0B1F60]/40 to-transparent"></div>

                                {/* Badge Fecha */}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-2 text-center min-w-[60px] shadow-lg">
                                    <span className="block text-xs font-bold text-rose-500 uppercase">DIC</span>
                                    <span className="block text-xl font-black text-slate-900">{event.date.split('-')[2]}</span>
                                </div>

                                <div className="absolute bottom-4 left-4 right-4">
                                    <h2 className="text-white font-bold text-2xl leading-tight mb-1 drop-shadow-md">
                                        {event.title}
                                    </h2>
                                    <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                                        <Clock size={14} />
                                        <span>{event.time} - {event.endTime || 'Late'}</span>
                                        <span className="bg-rose-500 text-white px-2 py-0.5 rounded-full text-xs ml-2 shadow-sm animate-pulse">
                                            Alta Demanda 🔥
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Info y Acción */}
                            <div className="p-5">
                                <div className="flex items-start gap-3 text-slate-600 mb-4">
                                    <MapPin size={18} className="mt-0.5 shrink-0 text-[#0B1F60]" />
                                    <p className="text-sm font-medium leading-relaxed">
                                        {event.locationName}
                                        <br />
                                        <span className="text-xs text-slate-400">{event.description}</span>
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleFindParking(event.id)}
                                    className="w-full bg-[#0B1F60] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Navigation size={18} />
                                    Encontrar Parqueo Cerca
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
