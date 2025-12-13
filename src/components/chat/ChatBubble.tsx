import { IMessage } from '../../types';

interface ChatBubbleProps {
    message: IMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
    const isFromMe = message.isFromCurrentUser;

    // Formatear día y hora
    const formatDateTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        const time = date.toLocaleTimeString('es-EC', {
            hour: '2-digit',
            minute: '2-digit',
        });

        if (isToday) {
            return `Hoy, ${time}`;
        } else if (isYesterday) {
            return `Ayer, ${time}`;
        } else {
            const day = date.toLocaleDateString('es-EC', {
                day: 'numeric',
                month: 'short',
            });
            return `${day}, ${time}`;
        }
    };

    return (
        <div className={`flex ${isFromMe ? 'justify-end' : 'justify-start'} mb-3`}>
            <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${isFromMe
                    ? 'bg-blue-100 text-slate-900 rounded-br-md' // Azul bajito, letras negras
                    : 'bg-slate-100 text-slate-800 rounded-bl-md'
                    }`}
            >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p
                    className={`text-[10px] mt-1 ${isFromMe ? 'text-blue-600/70' : 'text-slate-400'
                        }`}
                >
                    {formatDateTime(message.timestamp)}
                </p>
            </div>
        </div>
    );
}
