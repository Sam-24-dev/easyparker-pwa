import { useState, useEffect } from 'react';
import { RazonReporte } from '../types';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { VerifiedBadge } from '../components/profile/VerifiedBadge';
import { ProfileStats } from '../components/profile/ProfileStats';
import { ReportModal } from '../components/report/ReportModal';
import { useProfile } from '../context/ProfileContext';
import { useRating } from '../context/RatingContext';
import { useReport } from '../context/ReportContext';
import { useAuth } from '../context/AuthContext';
import { useReservaContext } from '../context/ReservaContext';
import {
    ArrowLeft,
    MapPin,
    Flag,
    Edit,
    Star,
    MessageCircle,
    Calendar
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { getDefaultAvatar, getTimeAsMember } from '../data/usersMock';

export function Profile() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { getProfileById, getCurrentUserProfile } = useProfile();
    const { getRatingsByUserId, getAverageRating } = useRating();
    const { addReport, hasReportedUser } = useReport();
    const { getReservasCompletadas, getReservasActivas } = useReservaContext();

    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Determinar qué perfil mostrar
    const isOwnProfile = !userId || userId === user?.id;
    const profile = isOwnProfile
        ? getCurrentUserProfile()
        : getProfileById(userId || '');

    const userRatings = profile ? getRatingsByUserId(profile.id) : [];
    const avgRating = profile ? getAverageRating(profile.id) : 0;
    const alreadyReported = user && profile ? hasReportedUser(user.id, profile.id) : false;

    // Contar reservas reales del usuario actual
    const reservasCompletadas = isOwnProfile ? getReservasCompletadas().length : (profile?.estadisticas.reservasCompletadas || 0);
    const reservasActivas = isOwnProfile ? getReservasActivas().length : 0;
    const totalReservas = reservasCompletadas + reservasActivas;

    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    if (!profile) {
        return (
            <Layout showNav>
                <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-slate-500 mb-4">Perfil no encontrado</p>
                    <Button onClick={() => navigate(-1)}>Volver</Button>
                </div>
            </Layout>
        );
    }

    const handleReport = (data: { razon: RazonReporte; descripcion?: string }) => {
        if (!user || !profile) return;
        addReport({
            reportadoPorId: user.id,
            reportadoAId: profile.id,
            razon: data.razon,
            descripcion: data.descripcion,
        });
        setToastMessage('Reporte enviado. ¡Gracias por ayudar a mantener la comunidad segura!');
    };

    const getRolLabel = (rol: string) => {
        switch (rol) {
            case 'conductor': return 'Conductor';
            case 'anfitrion': return 'Anfitrión';
            case 'ambos': return 'Conductor y Anfitrión';
            default: return rol;
        }
    };

    return (
        <Layout showNav>
            {/* Header con foto */}
            <div className="relative">
                {/* Background gradient */}
                <div className="h-32 bg-gradient-to-br from-[#0A1F63] to-[#132A74] rounded-b-3xl" />

                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition"
                >
                    <ArrowLeft size={20} />
                </button>

                {/* Edit / Report button */}
                {isOwnProfile ? (
                    <button
                        onClick={() => setToastMessage('Edición de perfil próximamente')}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition"
                    >
                        <Edit size={20} />
                    </button>
                ) : !alreadyReported && (
                    <button
                        onClick={() => setReportModalOpen(true)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition"
                    >
                        <Flag size={20} />
                    </button>
                )}

                {/* Profile photo */}
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                    <div className="relative">
                        <img
                            src={profile.foto || getDefaultAvatar(profile.nombre)}
                            alt={profile.nombre}
                            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-slate-200"
                        />
                        {profile.verificado && (
                            <div className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow">
                                <VerifiedBadge size="md" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Profile content */}
            <div className="pt-20 px-4 pb-8 space-y-6">
                {/* Name and basic info */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
                        {profile.nombre}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">{getRolLabel(profile.rol)}</p>
                    {profile.ubicacion && (
                        <p className="text-sm text-slate-500 flex items-center justify-center gap-1 mt-2">
                            <MapPin size={14} />
                            {profile.ubicacion}
                        </p>
                    )}
                </div>

                {/* Bio */}
                {profile.bio && (
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <p className="text-sm text-slate-600 italic">"{profile.bio}"</p>
                    </div>
                )}

                {/* Stats */}
                <ProfileStats profile={{
                    ...profile,
                    estadisticas: {
                        ...profile.estadisticas,
                        calificacionPromedio: avgRating || profile.estadisticas.calificacionPromedio,
                        reservasCompletadas: totalReservas
                    }
                }} />

                {/* Member since */}
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                    <Calendar size={16} />
                    <span>Miembro desde {getTimeAsMember(profile.fechaRegistro)}</span>
                </div>

                {/* Reviews section */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <MessageCircle size={20} />
                        Reseñas ({userRatings.length})
                    </h2>

                    {userRatings.length === 0 ? (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
                            <p className="text-slate-500">Aún no hay reseñas</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {userRatings.map((rating) => (
                                <div
                                    key={rating.id}
                                    className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
                                >
                                    <div className="flex items-start gap-3">
                                        <img
                                            src={rating.fromUserPhoto || getDefaultAvatar(rating.fromUserName || 'Usuario')}
                                            alt={rating.fromUserName}
                                            className="w-10 h-10 rounded-full object-cover bg-slate-200"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-slate-800 text-sm">
                                                    {rating.fromUserName || 'Usuario'}
                                                </p>
                                                <span className="text-xs text-slate-400">{rating.fecha}</span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        size={12}
                                                        className={star <= rating.estrellas ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}
                                                    />
                                                ))}
                                            </div>
                                            {rating.comentario && (
                                                <p className="text-sm text-slate-600 mt-2">{rating.comentario}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Report Modal */}
            <ReportModal
                isOpen={reportModalOpen}
                onClose={() => setReportModalOpen(false)}
                onSubmit={handleReport}
                targetName={profile.nombre}
            />

            {/* Toast */}
            {toastMessage && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#0B1F60] text-white text-sm font-semibold px-4 py-3 rounded-full shadow-lg animate-slide-up z-50 text-center max-w-[90%]">
                    {toastMessage}
                </div>
            )}
        </Layout>
    );
}
