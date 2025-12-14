import { useState } from 'react';
import { Send } from 'lucide-react';
import { driverQuickReplies, hostQuickReplies, hostSupportQuickReplies, driverSupportQuickReplies } from '../../data/chatMock';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
    userType?: 'driver' | 'host';
    conversationType?: 'driver' | 'host' | 'support';
}

export function ChatInput({
    onSend,
    disabled = false,
    placeholder = 'Escribe un mensaje...',
    userType = 'driver',
    conversationType = 'driver'
}: ChatInputProps) {
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSend(message.trim());
            setMessage('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleQuickReply = (reply: string) => {
        onSend(reply);
    };

    // Obtener las sugerencias correctas según el tipo de conversación y usuario
    const getQuickReplies = (): string[] => {
        if (conversationType === 'support') {
            return userType === 'host' ? hostSupportQuickReplies : driverSupportQuickReplies;
        }
        // Si el usuario es conductor, muestra quick replies para hablar con anfitrión
        // Si el usuario es anfitrión, muestra quick replies para hablar con conductor
        return userType === 'driver' ? driverQuickReplies : hostQuickReplies;
    };

    const quickReplies = getQuickReplies();

    // Color de fondo según el tipo de usuario
    const bgColor = userType === 'host' ? 'bg-emerald-900' : 'bg-[#0A1F63]';

    return (
        <div className={`fixed bottom-0 left-0 right-0 ${bgColor} pb-safe z-40`}>
            <div className="max-w-md mx-auto bg-white border-t border-slate-200">
                {/* Quick Replies */}
                <div className="px-4 pt-3 pb-2 border-b border-slate-100">
                    <div className="flex flex-wrap gap-2">
                        {quickReplies.map((reply, index) => (
                            <button
                                key={index}
                                onClick={() => handleQuickReply(reply)}
                                disabled={disabled}
                                className="px-3 py-1.5 text-xs rounded-full bg-slate-100 text-slate-700 hover:bg-indigo-100 hover:text-indigo-700 transition-all border border-slate-200 hover:border-indigo-300 disabled:opacity-50"
                            >
                                {reply}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="px-4 py-3">
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            disabled={disabled}
                            className="flex-1 px-4 py-3 bg-slate-100 rounded-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={!message.trim() || disabled}
                            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Enviar mensaje"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
