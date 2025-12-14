import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { IMessage, IConversation } from '../types';
import { useNotification } from './NotificationContext';
import {
    getSmartDriverResponse,
    getSmartHostResponse,
    getSmartSupportResponse
} from '../data/chatMock';

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
        isRealChat?: boolean; // true si es garaje reclamado/creado
        driverId?: string;
        driverName?: string;
        driverPhoto?: string;
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
    getMessagesByConversation: (conversationId: string, viewerRole?: 'driver' | 'host') => IMessage[];
    sendMessage: (conversationId: string, content: string, role?: 'driver' | 'host', skipAutoReply?: boolean) => void;
    sendInitialMessage: (conversationId: string, content: string, senderInfo: { id: string; name: string; photo?: string }, role?: 'driver' | 'host') => void;
    markAsRead: (conversationId: string, role?: 'driver' | 'host') => void;

    // Contadores
    getTotalUnreadCount: (role?: 'driver' | 'host') => number;
    getUnreadCountByType: (type: 'host' | 'driver' | 'support', role?: 'driver' | 'host') => number;
}

// ========== Contexto ==========
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// ========== Datos Mock Iniciales ==========
const getInitialMockConversations = (): IConversation[] => [
    // Conversación ejemplo para conductor con anfitrión
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
    // Chat de soporte SEPARADO para conductor
    {
        id: 'conv-support-driver',
        type: 'support',
        participantId: 'easyparker-support-driver',
        participantName: 'Atención EasyParker',
        lastMessage: '¡Hola! ¿En qué puedo ayudarte hoy?',
        lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        unreadCount: 0,
        isActive: true,
    },
    // Chat de soporte SEPARADO para anfitrión
    {
        id: 'conv-support-host',
        type: 'support',
        participantId: 'easyparker-support-host',
        participantName: 'Atención EasyParker',
        lastMessage: '¡Hola anfitrión! ¿En qué puedo ayudarte hoy?',
        lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        unreadCount: 0,
        isActive: true,
    },
];

const getInitialMockMessages = (): IMessage[] => [
    // Mensajes para conversación con Patricia Morales
    {
        id: 'msg-mock-patricia-1',
        conversationId: 'conv-4',
        senderId: 'host-ceibos',
        senderName: 'Patricia Morales',
        senderPhoto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
        content: 'Hola! Bienvenido, cualquier cosa me avisas.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        isFromCurrentUser: false,
    },
    // Mensaje inicial de soporte para conductor
    {
        id: 'msg-mock-support-driver-1',
        conversationId: 'conv-support-driver',
        senderId: 'easyparker-support-driver',
        senderName: 'Atención EasyParker',
        content: '¡Hola! ¿En qué puedo ayudarte hoy?',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        isFromCurrentUser: false,
    },
    // Mensaje inicial de soporte para anfitrión
    {
        id: 'msg-mock-support-host-1',
        conversationId: 'conv-support-host',
        senderId: 'easyparker-support-host',
        senderName: 'Atención EasyParker',
        content: '¡Hola anfitrión! ¿En qué puedo ayudarte hoy?',
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
            // Si hay datos guardados con conversaciones, usarlos
            if (data.conversations && data.conversations.length > 0) {
                // Migrar de conv-support antiguo a los nuevos IDs separados
                const migratedConversations = data.conversations.map((c: IConversation) => {
                    if (c.id === 'conv-support') {
                        return { ...c, id: 'conv-support-driver', participantId: 'easyparker-support-driver' };
                    }
                    return c;
                });

                // Migrar mensajes también
                const migratedMessages = (data.messages || []).map((m: IMessage) => {
                    if (m.conversationId === 'conv-support') {
                        return { ...m, conversationId: 'conv-support-driver' };
                    }
                    return m;
                });

                // Asegurar que existan ambos chats de soporte
                const hasDriverSupport = migratedConversations.some((c: IConversation) => c.id === 'conv-support-driver');
                const hasHostSupport = migratedConversations.some((c: IConversation) => c.id === 'conv-support-host');

                if (!hasDriverSupport) {
                    migratedConversations.push(getInitialMockConversations().find(c => c.id === 'conv-support-driver')!);
                    migratedMessages.push(getInitialMockMessages().find(m => m.conversationId === 'conv-support-driver')!);
                }
                if (!hasHostSupport) {
                    migratedConversations.push(getInitialMockConversations().find(c => c.id === 'conv-support-host')!);
                    migratedMessages.push(getInitialMockMessages().find(m => m.conversationId === 'conv-support-host')!);
                }

                return {
                    conversations: migratedConversations,
                    messages: migratedMessages
                };
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

// ========== Provider ==========
export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [conversations, setConversations] = useState<IConversation[]>(() => loadChatData().conversations);
    const [messages, setMessages] = useState<IMessage[]>(() => loadChatData().messages);

    // Guardar en localStorage cada vez que cambian conversations o messages
    useEffect(() => {
        try {
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({ conversations, messages }));
        } catch (error) {
            console.warn('Error saving chat data:', error);
        }
    }, [conversations, messages]);

    // Notificaciones Globales de Chat
    const { showNotification } = useNotification();
    const prevMessagesRef = useRef<IMessage[]>([]);

    useEffect(() => {
        // Inicializar ref en la primera carga sin notificar
        if (prevMessagesRef.current.length === 0 && messages.length > 0) {
            prevMessagesRef.current = messages;
            return;
        }

        const newMessages = messages.filter(m => !prevMessagesRef.current.find(pm => pm.id === m.id));

        newMessages.forEach(m => {
            // Solo notificar si NO es del usuario actual (es decir, es una respuesta recibida)
            if (m.isFromCurrentUser === false) {
                showNotification({
                    title: m.senderName,
                    message: m.content,
                    type: 'message'
                });
            }
        });

        prevMessagesRef.current = messages;
    }, [messages, showNotification]);

    // Sincronización entre pestañas (Real-Time Mock)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === CHAT_STORAGE_KEY) {
                const newData = loadChatData();
                setConversations(newData.conversations);
                setMessages(newData.messages);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Obtener conversaciones filtradas
    const getConversations = useCallback((type?: 'all' | 'host' | 'driver' | 'support') => {
        if (!type || type === 'all') {
            return [...conversations].sort((a, b) =>
                new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
            );
        }
        return conversations
            .filter(c => {
                if (c.type === type) return true;

                // Solo mostrar chats cruzados si es AUTO-RESERVA (mismo usuario)
                // Esto evita que el conductor vea chats del anfitrión con OTROS usuarios
                const isSelfChat = c.driverId === c.hostId;

                if (type === 'driver' && c.type === 'host' && c.isRealChat && isSelfChat) return true;
                if (type === 'host' && c.type === 'driver' && c.isRealChat && isSelfChat) return true;

                return false;
            })
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

        setConversations(prev => [newConversation, ...prev]);
        return newConversation;
    }, []);

    // Crear conversación cuando un conductor hace una reserva
    // Esta conversación será visible para AMBOS: conductor y anfitrión
    const createConversationFromReserva = useCallback((params: {
        hostId: string;
        hostName: string;
        hostPhoto?: string;
        parkingId: number;
        parkingName: string;
        reservaId: string;
        isRealChat?: boolean; // true si es garaje reclamado/creado
        driverId?: string;
        driverName?: string;
        driverPhoto?: string;
    }) => {
        // Verificar si ya existe una conversación para esta reserva
        const existing = conversations.find(c => c.reservaId === params.reservaId);
        if (existing) return existing;

        const newConversation: IConversation = {
            id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'driver', // Tipo base: el conductor lo ve como chat con anfitrión
            participantId: params.hostId,
            participantName: params.hostName,
            participantPhoto: params.hostPhoto,
            // Guardar info de ambos lados para visibilidad cruzada
            hostId: params.hostId,
            hostName: params.hostName,
            hostPhoto: params.hostPhoto,
            driverId: params.driverId || 'current-user', // Fallback si falta
            driverName: params.driverName || 'Conductor',
            driverPhoto: params.driverPhoto,
            // Otros campos
            reservaId: params.reservaId,
            parkingId: params.parkingId,
            parkingName: params.parkingName,
            lastMessage: 'Nueva conversación',
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0,
            isActive: true,
            isRealChat: params.isRealChat || false, // Chat real si es garaje reclamado/creado
        };

        setConversations(prev => [newConversation, ...prev]);

        // RECUPERADO: Enviar mensaje de bienvenida automático del anfitrión
        // Esto simula que el anfitrión saluda apenas reservas
        setTimeout(() => {
            const welcomeMsg: IMessage = {
                id: `msg-welcome-${Date.now()}`,
                conversationId: newConversation.id,
                senderId: params.hostId,
                senderName: params.hostName,
                senderPhoto: params.hostPhoto,
                senderType: 'host',
                content: `¡Hola ${params.driverName}! Gracias por tu reserva en ${params.parkingName}. Aquí estoy para lo que necesites.`,
                timestamp: new Date().toISOString(),
                isRead: false,
                isFromCurrentUser: false,
            };

            setMessages(prev => [...prev, welcomeMsg]);

            // Actualizar preview de la conversación
            setConversations(prev => prev.map(c =>
                c.id === newConversation.id
                    ? { ...c, lastMessage: welcomeMsg.content, lastMessageTime: welcomeMsg.timestamp, unreadCount: 1, unreadCountDriver: 1 }
                    : c
            ));
        }, 500);

        return newConversation;
    }, [conversations]);


    // Crear conversación cuando un anfitrión acepta una solicitud
    // SIEMPRE es chat real porque el anfitrión tiene que haber reclamado/creado el garaje
    // Esta conversación será visible para AMBOS: anfitrión y conductor
    const createConversationFromRequest = useCallback((params: {
        driverId: string;
        driverName: string;
        driverPhoto?: string;
        parkingId: number;
        parkingName: string;
        requestId: string;
        hostId?: string;
        hostName?: string;
        hostPhoto?: string;
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
            // Guardar info de ambos lados para visibilidad cruzada
            driverId: params.driverId,
            driverName: params.driverName,
            driverPhoto: params.driverPhoto,
            hostId: params.hostId || 'current-user',
            hostName: params.hostName || 'Anfitrión',
            hostPhoto: params.hostPhoto,
            // Otros campos
            reservaId: params.requestId,
            parkingId: params.parkingId,
            parkingName: params.parkingName,
            lastMessage: 'Nueva conversación',
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0,
            isActive: true,
            isRealChat: true, // Siempre real porque el anfitrión tiene el garaje
        };

        setConversations(prev => [newConversation, ...prev]);
        return newConversation;
    }, [conversations]);

    // Enviar mensaje inicial (desde otro usuario, no el actual)
    const sendInitialMessage = useCallback((
        conversationId: string,
        content: string,
        senderInfo: { id: string; name: string; photo?: string },
        role?: 'driver' | 'host'
    ) => {
        const newMessage: IMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            conversationId,
            senderId: senderInfo.id,
            senderName: senderInfo.name,
            senderPhoto: senderInfo.photo,
            senderType: role,
            content,
            timestamp: new Date().toISOString(),
            isRead: false,
            isFromCurrentUser: false,
        };

        setMessages(prev => [...prev, newMessage]);
        setConversations(prev =>
            prev.map(c =>
                c.id === conversationId
                    ? {
                        ...c,
                        lastMessage: content,
                        lastMessageTime: new Date().toISOString(),
                        unreadCount: c.unreadCount + 1, // Legacy
                        unreadCountDriver: role === 'host' ? (c.unreadCountDriver || 0) + 1 : (c.unreadCountDriver || 0),
                        unreadCountHost: role === 'driver' ? (c.unreadCountHost || 0) + 1 : (c.unreadCountHost || 0),
                    }
                    : c
            )
        );
    }, []);

    // Obtener mensajes de una conversación
    const getMessagesByConversation = useCallback((conversationId: string, viewerRole?: 'driver' | 'host') => {
        return messages
            .filter(m => m.conversationId === conversationId)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            .map(m => {
                // Calcular si es del usuario actual basado en el rol del visualizador
                let isFromCurrentUser = m.isFromCurrentUser; // Fallback para mensajes antiguos

                if (viewerRole && m.senderType) {
                    isFromCurrentUser = m.senderType === viewerRole;
                } else if (viewerRole) {
                    // Fallback para mensajes sin senderType
                    if (viewerRole === 'driver') {
                        // Si soy conductor, mensajes de 'host' o 'support' NO son míos
                        isFromCurrentUser = m.senderId === 'current-user' || m.senderId === 'driver-id';
                    } else {
                        // Si soy anfitrión, mensajes de 'driver' NO son míos
                        isFromCurrentUser = m.senderId === 'current-user' || m.senderId === 'host-id';
                    }
                }

                return { ...m, isFromCurrentUser };
            });
    }, [messages]);

    // Enviar mensaje
    const sendMessage = useCallback((conversationId: string, content: string, role: 'driver' | 'host' = 'driver', skipAutoReply: boolean = false) => {
        const newMessage: IMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            conversationId,
            senderId: role === 'driver' ? 'driver-id' : 'host-id',
            senderName: role === 'driver' ? 'Tú (Conductor)' : 'Tú (Anfitrión)',
            senderType: role, // 'driver' o 'host'
            content,
            timestamp: new Date().toISOString(),
            isRead: true,
            isFromCurrentUser: true, // Se guardará como true, pero getMessages recalculará
        };

        setMessages(prev => [...prev, newMessage]);

        // Actualizar última conversación
        setConversations(prev =>
            prev.map(c => {
                if (c.id !== conversationId) return c;

                const isSupport = c.type === 'support';

                return {
                    ...c,
                    lastMessage: content,
                    lastMessageTime: new Date().toISOString(),
                    unreadCount: c.unreadCount + 1, // Legacy
                    unreadCountDriver: (!isSupport && role === 'host') ? (c.unreadCountDriver || 0) + 1 : (c.unreadCountDriver || 0),
                    unreadCountHost: (!isSupport && role === 'driver') ? (c.unreadCountHost || 0) + 1 : (c.unreadCountHost || 0),
                };
            })
        );

        // Buscar la conversación
        const conversation = conversations.find(c => c.id === conversationId);

        // BOt: Si skipAutoReply es true, no enviar auto-reply
        if (skipAutoReply) return;

        // RECUPERADO: Si es chat real (dueño garaje = usuario), NO responder automáticamente
        if (conversation?.isRealChat) return;

        // Respuesta automática mock después de 2-3 segundos
        if (conversation) {
            const delay = 2000 + Math.random() * 1000; // 2-3 segundos

            setTimeout(() => {
                let responseContent: string;
                let senderName: string;
                let senderPhoto: string | undefined;

                if (conversation.type === 'support' || conversation.id.includes('support')) {
                    responseContent = getSmartSupportResponse(content); // Usar respuesta inteligente
                    senderName = 'Atención EasyParker';
                } else if (conversation.type === 'host' || role === 'host') {
                    // El usuario es anfitrión (o sender es Host), respuesta del conductor (inteligente)
                    responseContent = getSmartDriverResponse(content);
                    senderName = conversation.participantName;
                    senderPhoto = conversation.participantPhoto;
                } else {
                    // El usuario es conductor (o sender es Driver), respuesta del anfitrión (inteligente)
                    responseContent = getSmartHostResponse(content);
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

                setMessages(prev => [...prev, autoReply]);

                setConversations(prev =>
                    prev.map(c =>
                        c.id === conversationId
                            ? {
                                ...c,
                                lastMessage: responseContent,
                                lastMessageTime: new Date().toISOString(),
                                unreadCount: c.unreadCount + 1,
                                unreadCountDriver: role === 'driver' ? (c.unreadCountDriver || 0) + 1 : (c.unreadCountDriver || 0),
                                unreadCountHost: role === 'host' ? (c.unreadCountHost || 0) + 1 : (c.unreadCountHost || 0),
                            }
                            : c
                    )
                );
            }, delay);
        }
    }, [conversations]);



    // Marcar conversación como leída
    const markAsRead = useCallback((conversationId: string, role?: 'driver' | 'host') => {
        // Marcar mensajes como leídos
        setMessages(prev =>
            prev.map(m =>
                m.conversationId === conversationId ? { ...m, isRead: true } : m
            )
        );

        // Resetear contador de no leídos
        setConversations(prev =>
            prev.map(c => {
                if (c.id !== conversationId) return c;

                // Si no hay rol, reseteamos el legacy (comportamiento anterior)
                if (!role) return { ...c, unreadCount: 0 };

                return {
                    ...c,
                    unreadCount: 0, // Legacy reset
                    unreadCountDriver: role === 'driver' ? 0 : c.unreadCountDriver,
                    unreadCountHost: role === 'host' ? 0 : c.unreadCountHost,
                };
            })
        );
    }, []);

    // Obtener total de mensajes no leídos
    const getTotalUnreadCount = useCallback((role?: 'driver' | 'host') => {
        return conversations.reduce((sum, c) => {
            if (role === 'host') {
                // Si estoy en modo HOST, cuento:
                // 1. Chats propios de host
                // 2. Chats REALES de auto-reserva (donde hostId == driverId)
                const isHostChat = c.type === 'host';
                const isSelfChat = c.driverId === c.hostId;
                const isRealDriverChat = c.type === 'driver' && c.isRealChat && isSelfChat;

                if (isHostChat || isRealDriverChat) {
                    // Excluir chats de soporte de driver
                    if (c.id.includes('support-driver')) return sum;
                    return sum + (c.unreadCountHost || 0);
                }
                return sum;
            }
            if (role === 'driver') {
                // Si estoy en modo DRIVER, cuento:
                // 1. Chats propios de driver
                // 2. Chats REALES de auto-reserva
                const isDriverChat = c.type === 'driver';
                const isSelfChat = c.driverId === c.hostId;
                const isRealHostChat = c.type === 'host' && c.isRealChat && isSelfChat;

                if (isDriverChat || isRealHostChat) {
                    // Excluir chats de soporte de host
                    if (c.id.includes('support-host')) return sum;
                    return sum + (c.unreadCountDriver || 0);
                }
                return sum;
            }
            return sum + c.unreadCount;
        }, 0);
    }, [conversations]);

    // Obtener no leídos por tipo
    const getUnreadCountByType = useCallback((type: 'host' | 'driver' | 'support', role?: 'driver' | 'host') => {
        return conversations
            .filter(c => {
                if (c.type === type) return true;
                // Lógica espejo para chats reales (SOLO AUTO-RESERVA)
                const isSelfChat = c.driverId === c.hostId;
                if (type === 'driver' && c.type === 'host' && c.isRealChat && isSelfChat) return true;
                if (type === 'host' && c.type === 'driver' && c.isRealChat && isSelfChat) return true;
                return false;
            })
            .reduce((sum, c) => {
                if (role === 'host') {
                    // Si el chat es de soporte DRIVER, ignorarlo en vistas host
                    if (c.id.includes('support-driver')) return sum;
                    return sum + (c.unreadCountHost || 0);
                }
                if (role === 'driver') {
                    // Si el chat es de soporte HOST, ignorarlo en vistas driver
                    if (c.id.includes('support-host')) return sum;
                    return sum + (c.unreadCountDriver || 0);
                }
                return sum + c.unreadCount;
            }, 0);
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
