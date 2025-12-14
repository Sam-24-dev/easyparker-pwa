import React, { useState, useEffect } from 'react';
import { IEvent } from '../../types';
import { Timer, MapPin, ChevronRight, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EventBannerProps {
    events: IEvent[];
}

export const EventBanner: React.FC<EventBannerProps> = ({ events }) => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);

    // Rotar eventos cada 5 segundos
    useEffect(() => {
        if (events.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % events.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [events]);

    if (events.length === 0) return null;

    const event = events[currentIndex];

    // Cálculo simple de tiempo restante (mocked logic para demo visual)
    // Asumimos que el evento es en el futuro cercano
    const timeLeft = "02:45:10";

    return (
        <div
            onClick={() => navigate('/events')}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0C1F63] via-[#1C2F74] to-[#0C1F63] p-4 text-white shadow-lg cursor-pointer group border border-white/10"
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

            {/* Floating Elements Animation */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>

            <div className="relative z-10 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-rose-500 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse shadow-sm flex items-center gap-1">
                            <Ticket size={10} />
                            EVENTO CERCA
                        </span>
                        <span className="text-xs text-indigo-200 font-medium flex items-center gap-1">
                            <Timer size={12} />
                            Empieza en {timeLeft}
                        </span>
                    </div>

                    <h3 className="font-bold text-lg leading-tight truncate pr-2">
                        {event.title}
                    </h3>

                    <p className="text-xs text-indigo-100 mt-1 flex items-center gap-1 truncate">
                        <MapPin size={12} />
                        {event.locationName}
                    </p>
                </div>

                <div className="flex flex-col items-center justify-center pl-2 border-l border-white/20">
                    <span className="text-xs font-medium text-center opacity-90 mb-1">Ver</span>
                    <div className="bg-white/20 p-2 rounded-full group-hover:bg-white group-hover:text-indigo-600 transition-all">
                        <ChevronRight size={20} />
                    </div>
                </div>
            </div>
        </div>
    );
};
