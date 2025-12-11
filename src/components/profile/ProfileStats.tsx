import { Calendar, Car, Star, Clock, Home } from 'lucide-react';
import { IUserProfile } from '../../types';
import { getTimeAsMember } from '../../data/usersMock';

interface ProfileStatsProps {
    profile: IUserProfile;
}

export function ProfileStats({ profile }: ProfileStatsProps) {
    const tiempoMiembro = getTimeAsMember(profile.fechaRegistro);

    const stats = [
        {
            icon: Star,
            value: profile.estadisticas.calificacionPromedio.toFixed(1),
            label: 'Calificación',
            color: 'text-yellow-500',
        },
        {
            icon: Car,
            value: profile.estadisticas.reservasCompletadas,
            label: 'Reservas',
            color: 'text-blue-500',
        },
        {
            icon: Calendar,
            value: tiempoMiembro,
            label: 'Miembro',
            color: 'text-green-500',
        },
    ];

    // Agregar estadísticas de anfitrión si aplica
    if (profile.rol === 'anfitrion' || profile.rol === 'ambos') {
        stats.push({
            icon: Home,
            value: profile.estadisticas.reservasRecibidas || 0,
            label: 'Recibidas',
            color: 'text-purple-500',
        });
    }

    // Agregar tiempo de respuesta si existe
    if (profile.estadisticas.tiempoRespuesta) {
        stats.push({
            icon: Clock,
            value: profile.estadisticas.tiempoRespuesta,
            label: 'Respuesta',
            color: 'text-emerald-500',
        });
    }

    return (
        <div className="grid grid-cols-3 gap-3">
            {stats.slice(0, 3).map((stat, index) => (
                <div
                    key={index}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center text-center"
                >
                    <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
                    <span className="text-lg font-bold text-slate-800">{stat.value}</span>
                    <span className="text-xs text-slate-500">{stat.label}</span>
                </div>
            ))}
            {stats.length > 3 && (
                <>
                    {stats.slice(3).map((stat, index) => (
                        <div
                            key={index + 3}
                            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center text-center"
                        >
                            <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
                            <span className="text-lg font-bold text-slate-800">{stat.value}</span>
                            <span className="text-xs text-slate-500">{stat.label}</span>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}
