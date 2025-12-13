import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { ConversationCard } from './ConversationCard';
import { useChatContext } from '../../context/ChatContext';

interface ConversationListProps {
    filter: 'all' | 'host' | 'driver' | 'support';
    userType: 'driver' | 'host';
}

export function ConversationList({ filter, userType }: ConversationListProps) {
    const navigate = useNavigate();
    const { conversations } = useChatContext();

    // Filtrar conversaciones según el tipo de usuario y filtro activo
    const filteredConversations = useMemo(() => {
        let convs = [...conversations];

        // Para conductor: mostrar conversaciones donde:
        // - type === 'driver' (conversaciones tradicionales con anfitriones)
        // - O es su chat de soporte
        // - O es una conversación real donde él es el driverId
        if (userType === 'driver') {
            convs = convs.filter(c =>
                c.type === 'driver' ||
                (c.type === 'support' && c.id === 'conv-support-driver') ||
                (c.isRealChat && c.driverId === 'current-user')
            );
        } else {
            // Para anfitrión: mostrar conversaciones donde:
            // - type === 'host' (conversaciones tradicionales con conductores)
            // - O es su chat de soporte
            // - O es una conversación real donde él es el hostId (viene de reservas de su garaje)
            convs = convs.filter(c =>
                c.type === 'host' ||
                (c.type === 'support' && c.id === 'conv-support-host') ||
                (c.isRealChat && c.hostId)
            );
        }

        // Aplicar filtro adicional
        if (filter !== 'all') {
            if (filter === 'support') {
                convs = convs.filter(c => c.type === 'support');
            } else if (filter === 'driver' || filter === 'host') {
                convs = convs.filter(c => c.type !== 'support');
            }
        }

        // Ordenar por fecha (más recientes primero)
        return convs.sort((a, b) =>
            new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
        );
    }, [filter, userType, conversations]);

    const handleConversationClick = (conversationId: string) => {
        if (userType === 'driver') {
            navigate(`/mensajes/${conversationId}`);
        } else {
            navigate(`/host/mensajes/${conversationId}`);
        }
    };

    // Empty state
    if (filteredConversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <MessageSquare size={28} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                    No hay mensajes
                </h3>
                <p className="text-sm text-slate-500 max-w-xs">
                    {userType === 'driver'
                        ? 'Cuando hagas una reserva, podrás chatear con el anfitrión aquí.'
                        : 'Cuando alguien reserve tu garaje, podrás chatear aquí.'}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white">
            {filteredConversations.map((conversation) => (
                <ConversationCard
                    key={conversation.id}
                    conversation={conversation}
                    onClick={() => handleConversationClick(conversation.id)}
                    userType={userType}
                />
            ))}
        </div>
    );
}

