import { IConversation } from '../../types';

interface ConversationCardProps {
    conversation: IConversation;
    onClick: () => void;
    userType?: 'driver' | 'host';
}

export function ConversationCard({ conversation, onClick, userType = 'driver' }: ConversationCardProps) {
    const isSupport = conversation.type === 'support';

    // Calcular contador de no leídos apropiado
    const unreadCount = (userType === 'host' ? conversation.unreadCountHost : conversation.unreadCountDriver) ?? conversation.unreadCount;

    // Formatear fecha
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Ayer';
        } else if (diffDays < 7) {
            return date.toLocaleDateString('es-EC', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' });
        }
    };

    return (
        <button
            onClick={onClick}
            className="w-full flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 text-left"
        >
            {/* Avatar / Imagen */}
            <div className="relative flex-shrink-0">
                {isSupport ? (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                ) : (
                    <img
                        src={conversation.participantPhoto || conversation.parkingPhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(conversation.participantName)}
                        alt={conversation.participantName}
                        className="w-14 h-14 rounded-full object-cover"
                    />
                )}

                {/* Badge de no leídos */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full bg-rose-500 text-[11px] font-bold text-white flex items-center justify-center px-1.5">
                        {Math.min(unreadCount, 9)}
                        {unreadCount > 9 && '+'}
                    </span>
                )}
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className={`font-semibold truncate ${unreadCount > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                        {isSupport ? 'Atención EasyParker' : conversation.participantName}
                    </h3>
                    <span className="text-xs text-slate-400 flex-shrink-0">
                        {formatDate(conversation.lastMessageTime)}
                    </span>
                </div>

                <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                    {conversation.lastMessage}
                </p>

                {/* Contexto del parking */}
                {conversation.parkingName && !isSupport && (
                    <p className="text-xs text-slate-400 truncate mt-1">
                        {conversation.parkingName}
                    </p>
                )}
            </div>
        </button>
    );
}
