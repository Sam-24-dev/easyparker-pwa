import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { ChatHeader } from '../components/chat/ChatHeader';
import { ChatBubble } from '../components/chat/ChatBubble';
import { ChatInput } from '../components/chat/ChatInput';
import { useChatContext } from '../context/ChatContext';

export function ChatView() {
    const { conversationId } = useParams<{ conversationId: string }>();
    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasMarkedAsRead = useRef(false);

    const {
        conversations,
        getMessagesByConversation,
        sendMessage,
        markAsRead,
        messages: contextMessages
    } = useChatContext();

    // Obtener conversación actual directamente del contexto
    const conversation = conversations.find(c => c.id === conversationId);

    // Obtener mensajes directamente del contexto (rol: driver)
    const messages = conversationId ? getMessagesByConversation(conversationId, 'driver') : [];

    // Redirigir si no hay conversationId
    useEffect(() => {
        if (!conversationId) {
            navigate('/mensajes');
            return;
        }
    }, [conversationId, navigate]);

    // Marcar como leído cuando se monta o cambia la conversación
    useEffect(() => {
        if (conversationId && conversation && !hasMarkedAsRead.current) {
            hasMarkedAsRead.current = true;
            markAsRead(conversationId, 'driver');
        }
    }, [conversationId, conversation, markAsRead]);

    // Reset hasMarkedAsRead cuando cambia la conversación
    useEffect(() => {
        hasMarkedAsRead.current = false;
    }, [conversationId]);

    // Scroll al final cuando hay nuevos mensajes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [contextMessages]);

    const handleSendMessage = (content: string) => {
        sendMessage(conversationId!, content, 'driver');
    };

    // Si no existe la conversación y ya tenemos el ID, redirigir
    if (!conversation && conversationId) {
        // Esperar un momento para que se cargue el contexto
        return (
            <div className="min-h-[100dvh] bg-[#0A1F63]">
                <div className="max-w-md mx-auto min-h-[100dvh] bg-white flex items-center justify-center shadow-2xl">
                    <p className="text-slate-500">Cargando...</p>
                </div>
            </div>
        );
    }

    if (!conversation) {
        return null;
    }

    return (
        <div className="min-h-[100dvh] bg-[#0A1F63]">
            <div className="max-w-md mx-auto min-h-[100dvh] bg-slate-50 flex flex-col shadow-2xl">
                {/* Header */}
                <ChatHeader conversation={conversation} userType="driver" />

                {/* Input con quick replies */}
                <ChatInput
                    onSend={handleSendMessage}
                    userType="driver"
                    conversationType={conversation.type}
                />

                {/* Messages container */}
                <div className="flex-1 overflow-y-auto px-4 py-4 pb-32">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                            Envía un mensaje para iniciar la conversación
                        </div>
                    ) : (
                        messages.map((message) => (
                            <ChatBubble key={message.id} message={message} />
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input con quick replies */}
                <ChatInput
                    onSend={handleSendMessage}
                    userType="driver"
                    conversationType={conversation.type}
                />
            </div>
        </div>
    );
}
