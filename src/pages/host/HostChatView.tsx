import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { ChatHeader } from '../../components/chat/ChatHeader';
import { ChatBubble } from '../../components/chat/ChatBubble';
import { ChatInput } from '../../components/chat/ChatInput';
import { IConversation, IMessage } from '../../types';
import { useChatContext } from '../../context/ChatContext';

export default function HostChatView() {
    const { conversationId } = useParams<{ conversationId: string }>();
    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasMarkedAsRead = useRef(false);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [conversation, setConversation] = useState<IConversation | null>(null);

    const {
        conversations,
        getMessagesByConversation,
        sendMessage,
        markAsRead,
        messages: contextMessages
    } = useChatContext();

    // Cargar conversación inicial
    useEffect(() => {
        if (!conversationId) {
            navigate('/host/mensajes');
            return;
        }

        // Buscar en el contexto
        const conv = conversations.find(c => c.id === conversationId);
        if (conv) {
            setConversation(conv);
            setMessages(getMessagesByConversation(conversationId));

            // Marcar como leído solo una vez
            if (!hasMarkedAsRead.current) {
                hasMarkedAsRead.current = true;
                markAsRead(conversationId);
            }
        } else {
            navigate('/host/mensajes');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId]);

    // Actualizar mensajes cuando cambian en el contexto (para respuestas automáticas)
    useEffect(() => {
        if (conversationId) {
            setMessages(getMessagesByConversation(conversationId));
        }
    }, [conversationId, contextMessages, getMessagesByConversation]);

    // Reset hasMarkedAsRead cuando cambia la conversación
    useEffect(() => {
        hasMarkedAsRead.current = false;
    }, [conversationId]);

    // Scroll al final cuando hay nuevos mensajes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (content: string) => {
        sendMessage(conversationId!, content);
    };

    if (!conversation) {
        return (
            <div className="min-h-[100dvh] bg-emerald-900">
                <div className="max-w-md mx-auto min-h-[100dvh] bg-white flex items-center justify-center shadow-2xl">
                    <p className="text-slate-500">Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-emerald-900">
            <div className="max-w-md mx-auto min-h-[100dvh] bg-slate-50 flex flex-col shadow-2xl">
                {/* Header */}
                <ChatHeader conversation={conversation} userType="host" />

                {/* Messages container */}
                <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
                    {messages.map((message) => (
                        <ChatBubble key={message.id} message={message} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <ChatInput onSend={handleSendMessage} userType="host" />
            </div>
        </div>
    );
}
