import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { IConversation } from '../../types';

interface ChatHeaderProps {
    conversation: IConversation;
    userType: 'driver' | 'host';
}

export function ChatHeader({ conversation, userType }: ChatHeaderProps) {
    const navigate = useNavigate();
    const isSupport = conversation.type === 'support';

    // Resolver la info de la OTRA persona dinámicamente
    // Si soy Driver, quiero ver al Host. Si soy Host, quiero ver al Driver.
    // Usamos los campos explícitos si existen, sino fallback a participantId legacy
    const partnerId = userType === 'driver' ? (conversation.hostId || conversation.participantId) : (conversation.driverId || conversation.participantId);
    const partnerName = userType === 'driver' ? (conversation.hostName || conversation.participantName) : (conversation.driverName || conversation.participantName);
    const partnerPhoto = userType === 'driver' ? (conversation.hostPhoto || conversation.participantPhoto) : (conversation.driverPhoto || conversation.participantPhoto);

    const handleBack = () => {
        if (userType === 'driver') {
            navigate('/mensajes');
        } else {
            navigate('/host/mensajes');
        }
    };

    const handleProfileClick = () => {
        if (!isSupport && partnerId && partnerId !== 'current-user') {
            navigate(`/perfil/${partnerId}`);
        }
    };

    return (
        <div className="sticky top-0 bg-white z-40 border-b border-slate-200 shadow-sm">
            <div className="px-2 py-3">
                <div className="flex items-center gap-3">
                    {/* Botón volver */}
                    <button
                        onClick={handleBack}
                        className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                        aria-label="Volver a mensajes"
                    >
                        <ArrowLeft size={24} className="text-slate-700" />
                    </button>

                    {/* Avatar - clickeable si no es soporte */}
                    <div
                        className={`flex-shrink-0 ${!isSupport ? 'cursor-pointer' : ''}`}
                        onClick={handleProfileClick}
                    >
                        {isSupport ? (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        ) : (
                            <img
                                src={partnerPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(partnerName)}`}
                                alt={partnerName}
                                className="w-10 h-10 rounded-full object-cover hover:ring-2 hover:ring-blue-400 transition"
                            />
                        )}
                    </div>

                    {/* Info - clickeable si no es soporte */}
                    <div
                        className={`flex-1 min-w-0 ${!isSupport ? 'cursor-pointer hover:opacity-80 transition' : ''}`}
                        onClick={handleProfileClick}
                    >
                        <h2 className="font-semibold text-slate-800 truncate">
                            {isSupport ? 'Atención EasyParker' : partnerName}
                        </h2>
                        {conversation.parkingName && !isSupport && (
                            <p className="text-xs text-slate-500 truncate">
                                {conversation.parkingName}
                            </p>
                        )}
                    </div>

                    {/* Menú */}
                    <button
                        className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                        aria-label="Más opciones"
                    >
                        <MoreVertical size={20} className="text-slate-500" />
                    </button>
                </div>
            </div>
        </div>
    );
}
