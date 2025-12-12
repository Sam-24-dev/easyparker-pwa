import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { IMessage, IConversation } from '../types';
import { getRandomHostResponse, getRandomDriverMessage, getRandomSupportResponse } from '../data/chatMock';

// ========== Constantes ==========
const CHAT_STORAGE_KEY = 'easyparker-chat-data';

// ========== Tipos del Contexto ==========
interface ChatContextType {
    // Estado
    conversations: IConversation[];
    messages: IMessage[];

    // Acciones de conversaciones
    getConversations: (type?: 'all' | 'host' | 'driver' | 'support') => IConversation[];
    getConversationById: (id: string) => IConversation | undefined;
    createConversation: (conversation: Omit<IConversation, 'id'>) => IConversation;

    // Funciones para integrar con reservas
    createConversationFromReserva: (params: {
        hostId: string;
        hostName: string;
        hostPhoto?: string;
        parkingId: number;
        parkingName: string;
        reservaId: string;
    }) => IConversation;

    createConversationFromRequest: (params: {
        driverId: string;
        driverName: string;
        driverPhoto?: string;
        parkingId: number;
        parkingName: string;
        requestId: string;
    }) => IConversation;

    // Acciones de mensajes
    getMessagesByConversation: (conversationId: string) => IMessage[];
    sendMessage: (conversationId: string, content: string) => void;
    sendInitialMessage: (conversationId: string, content: string, senderInfo: { id: string; name: string; photo?: string }) => void;
    markAsRead: (conversationId: string) => void;

    // Contadores
    getTotalUnreadCount: () => number;
    getUnreadCountByType: (type: 'host' | 'driver' | 'support') => number;
}

// ========== Contexto ==========
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// ========== Datos Mock Iniciales ==========
const getInitialMockConversations = (): IConversation[] => [
    // SOLO conversaciones para conductor (type: 'driver') y soporte
    // Las conversaciones de anfitrión (type: 'host') se crean dinámicamente al aceptar solicitudes
    {
        id: 'conv-3',
        type: 'driver',
        participantId: 'host-premium',
        participantName: 'Fernando Reyes',
        participantPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
        reservaId: 'reserva-3',
        parkingId: 5,
        parkingName: 'Garaje Las Iguanas Premium',
        lastMessage: 'Perfecto, te espero. El código del portón es 1234.',
        lastMessageTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        unreadCount: 1,
        isActive: true,
    },
    {
        id: 'conv-4',
        type: 'driver',
        participantId: 'host-ceibos',
        participantName: 'Patricia Morales',
        participantPhoto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
        reservaId: 'reserva-4',
        parkingId: 8,
        parkingName: 'Cochera Residencial Los Ceibos',
        lastMessage: 'Hola! Bienvenido, cualquier cosa me avisas.',
        lastMessageTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        unreadCount: 0,
        isActive: false,
    },
    {
        id: 'conv-support',
        type: 'support',
        participantId: 'easyparker-support',
        participantName: 'Atención EasyParker',
        lastMessage: '¡Hola! ¿En qué puedo ayudarte hoy?',
        lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        unreadCount: 0,
        isActive: true,
    },
];

const getInitialMockMessages = (): IMessage[] => [
    {
        id: 'msg-mock-1',
        conversationId: 'conv-3',
        senderId: 'current-user',
        senderName: 'Tú',
        content: 'Hola, acabo de reservar tu espacio para hoy.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        isFromCurrentUser: true,
    },
    {
        id: 'msg-mock-2',
        conversationId: 'conv-3',
        senderId: 'host-premium',
        senderName: 'Fernando Reyes',
        senderPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
        content: '¡Hola! Gracias por reservar. ¿A qué hora llegas aproximadamente?',
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        isFromCurrentUser: false,
    },
    {
        id: 'msg-mock-3',
        conversationId: 'conv-3',
        senderId: 'current-user',
        senderName: 'Tú',
        content: 'En unos 30 minutos estoy por ahí.',
        timestamp: new Date(Date.now() - 1.2 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        isFromCurrentUser: true,
    },
    {
        id: 'msg-mock-4',
        conversationId: 'conv-3',
        senderId: 'host-premium',
        senderName: 'Fernando Reyes',
        senderPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
        content: 'Perfecto, te espero. El código del portón es 1234.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        isFromCurrentUser: false,
    },
    // Mensaje de soporte
    {
        id: 'msg-mock-6',
        conversationId: 'conv-support',
        senderId: 'easyparker-support',
        senderName: 'Atención EasyParker',
        content: '¡Hola! ¿En qué puedo ayudarte hoy?',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        isFromCurrentUser: false,
    },
];

// ========== Funciones de Persistencia ==========
const loadChatData = (): { conversations: IConversation[], messages: IMessage[] } => {
    try {
        const stored = localStorage.getItem(CHAT_STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            // Si hay datos guardados, usarlos
            if (data.conversations && data.conversations.length > 0) {
                return data;
            }
        }
    } catch (error) {
        console.warn('Error loading chat data:', error);
    }
    // Si no hay datos guardados, usar mock inicial
    return {
        conversations: getInitialMockConversations(),
        messages: getInitialMockMessages()
    };
};

const saveChatData = (conversations: IConversation[], messages: IMessage[]) => {
    try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({ conversations, messages }));
    } catch (error) {
        console.warn('Error saving chat data:', error);
    }
};

// ========== Provider ==========
export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [conversations, setConversations] = useState<IConversation[]>(() => loadChatData().conversations);
    const [messages, setMessages] = useState<IMessage[]>(() => loadChatData().messages);

    // Obtener conversaciones filtradas
    const getConversations = useCallback((type?: 'all' | 'host' | 'driver' | 'support') => {
        if (!type || type === 'all') {
            return conversations.sort((a, b) =>
                new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
            );
        }
        return conversations
            .filter(c => c.type === type)
            .sort((a, b) =>
                new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
            );
    }, [conversations]);

    // Obtener conversación por ID
    const getConversationById = useCallback((id: string) => {
        return conversations.find(c => c.id === id);
    }, [conversations]);

    // Crear nueva conversación
    const createConversation = useCallback((conversationData: Omit<IConversation, 'id'>) => {
        const newConversation: IConversation = {
            ...conversationData,
            id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };

        setConversations(prev => {
            const updated = [newConversation, ...prev];
            saveChatData(updated, messages);
            return updated;
        });

        return newConversation;
    }, [messages]);

    // Crear conversación cuando un conductor hace una reserva
    const createConversationFromReserva = useCallback((params: {
        hostId: string;
        hostName: string;
        hostPhoto?: string;
        parkingId: number;
        parkingName: string;
        reservaId: string;
    }) => {
        // Verificar si ya existe una conversación para esta reserva
        const existing = conversations.find(c => c.reservaId === params.reservaId);
        if (existing) return existing;

        const newConversation: IConversation = {
            id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'driver', // El conductor ve conversaciones con anfitriones
            participantId: params.hostId,
            participantName: params.hostName,
            participantPhoto: params.hostPhoto,
            reservaId: params.reservaId,
            parkingId: params.parkingId,
            parkingName: params.parkingName,
            lastMessage: 'Nueva conversación',
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0,
            isActive: true,
        };

        setConversations(prev => {
            const updated = [newConversation, ...prev];
            saveChatData(updated, messages);
            return updated;
        });

        return newConversation;
    }, [conversations, messages]);

    // Crear conversación cuando un anfitrión acepta una solicitud
    const createConversationFromRequest = useCallback((params: {
        driverId: string;
        driverName: string;
        driverPhoto?: string;
        parkingId: number;
        parkingName: string;
        requestId: string;
    }) => {
        // Verificar si ya existe una conversación para esta solicitud
        const existing = conversations.find(c => c.reservaId === params.requestId);
        if (existing) return existing;

        const newConversation: IConversation = {
            id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'host', // El anfitrión ve conversaciones con conductores
            participantId: params.driverId,
            participantName: params.driverName,
            participantPhoto: params.driverPhoto,
            reservaId: params.requestId,
            parkingId: params.parkingId,
            parkingName: params.parkingName,
            lastMessage: 'Nueva conversación',
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0,
            isActive: true,
        };

        setConversations(prev => {
            const updated = [newConversation, ...prev];
            saveChatData(updated, messages);
            return updated;
        });

        return newConversation;
    }, [conversations, messages]);

    // Enviar mensaje inicial (desde otro usuario, no el actual)
    const sendInitialMessage = useCallback((
        conversationId: string,
        content: string,
        senderInfo: { id: string; name: string; photo?: string }
    ) => {
        const newMessage: IMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            conversationId,
            senderId: senderInfo.id,
            senderName: senderInfo.name,
            senderPhoto: senderInfo.photo,
            content,
            timestamp: new Date().toISOString(),
            isRead: false,
            isFromCurrentUser: false,
        };

        setMessages(prev => {
            const updated = [...prev, newMessage];
            saveChatData(conversations, updated);
            return updated;
        });

        setConversations(prev => {
            const updated = prev.map(c =>
                c.id === conversationId
                    ? {
                        ...c,
                        lastMessage: content,
                        lastMessageTime: new Date().toISOString(),
                        unreadCount: c.unreadCount + 1
                    }
                    : c
            );
            saveChatData(updated, messages);
            return updated;
        });
    }, [conversations, messages]);

    // Obtener mensajes de una conversación
    const getMessagesByConversation = useCallback((conversationId: string) => {
        return messages
            .filter(m => m.conversationId === conversationId)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [messages]);

    // Enviar mensaje
    const sendMessage = useCallback((conversationId: string, content: string) => {
        const newMessage: IMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            conversationId,
            senderId: 'current-user',
            senderName: 'Tú',
            content,
            timestamp: new Date().toISOString(),
            isRead: true,
            isFromCurrentUser: true,
        };

        setMessages(prev => {
            const updated = [...prev, newMessage];
            saveChatData(conversations, updated);
            return updated;
        });

        // Actualizar última conversación
        setConversations(prev => {
            const updated = prev.map(c =>
                c.id === conversationId
                    ? { ...c, lastMessage: content, lastMessageTime: new Date().toISOString() }
                    : c
            );
            saveChatData(updated, messages);
            return updated;
        });

        // Respuesta automática mock después de 2-3 segundos
        const conversation = conversations.find(c => c.id === conversationId);
        if (conversation) {
            const delay = 2000 + Math.random() * 1000; // 2-3 segundos

            setTimeout(() => {
                let responseContent: string;
                let senderName: string;
                let senderPhoto: string | undefined;

                if (conversation.type === 'support') {
                    responseContent = getRandomSupportResponse();
                    senderName = 'Atención EasyParker';
                } else if (conversation.type === 'host') {
                    // El usuario es anfitrión, respuesta del conductor
                    responseContent = getRandomDriverMessage();
                    senderName = conversation.participantName;
                    senderPhoto = conversation.participantPhoto;
                } else {
                    // El usuario es conductor, respuesta del anfitrión
                    responseContent = getRandomHostResponse();
                    senderName = conversation.participantName;
                    senderPhoto = conversation.participantPhoto;
                }

                const autoReply: IMessage = {
                    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    conversationId,
                    senderId: conversation.participantId,
                    senderName,
                    senderPhoto,
                    content: responseContent,
                    timestamp: new Date().toISOString(),
                    isRead: false,
                    isFromCurrentUser: false,
                };

                setMessages(prev => {
                    const updated = [...prev, autoReply];
                    saveChatData(conversations, updated);
                    return updated;
                });

                setConversations(prev => {
                    const updated = prev.map(c =>
                        c.id === conversationId
                            ? {
                                ...c,
                                lastMessage: responseContent,
                                lastMessageTime: new Date().toISOString(),
                                unreadCount: c.unreadCount + 1
                            }
                            : c
                    );
                    saveChatData(updated, messages);
                    return updated;
                });
            }, delay);
        }
    }, [conversations, messages]);

    // Marcar conversación como leída
    const markAsRead = useCallback((conversationId: string) => {
        // Marcar mensajes como leídos
        setMessages(prev => {
            const updated = prev.map(m =>
                m.conversationId === conversationId ? { ...m, isRead: true } : m
            );
            saveChatData(conversations, updated);
            return updated;
        });

        // Resetear contador de no leídos
        setConversations(prev => {
            const updated = prev.map(c =>
                c.id === conversationId ? { ...c, unreadCount: 0 } : c
            );
            saveChatData(updated, messages);
            return updated;
        });
    }, [conversations, messages]);

    // Obtener total de mensajes no leídos
    const getTotalUnreadCount = useCallback(() => {
        return conversations.reduce((sum, c) => sum + c.unreadCount, 0);
    }, [conversations]);

    // Obtener no leídos por tipo
    const getUnreadCountByType = useCallback((type: 'host' | 'driver' | 'support') => {
        return conversations
            .filter(c => c.type === type)
            .reduce((sum, c) => sum + c.unreadCount, 0);
    }, [conversations]);

    return (
        <ChatContext.Provider value={{
            conversations,
            messages,
            getConversations,
            getConversationById,
            createConversation,
            createConversationFromReserva,
            createConversationFromRequest,
            getMessagesByConversation,
            sendMessage,
            sendInitialMessage,
            markAsRead,
            getTotalUnreadCount,
            getUnreadCountByType,
        }}>
            {children}
        </ChatContext.Provider>
    );
};

// ========== Hook ==========
export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChatContext must be used within ChatProvider');
    }
    return context;
};
