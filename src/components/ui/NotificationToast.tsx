import React from 'react';
import { useNotification, NotificationType } from '../../context/NotificationContext';
import { X, CheckCircle, AlertCircle, Info, Bell, MessageCircle } from 'lucide-react';

const icons: Record<NotificationType, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    message: <MessageCircle className="w-5 h-5 text-indigo-500" />,
};

const bgColors: Record<NotificationType, string> = {
    success: 'bg-white border-l-4 border-emerald-500',
    error: 'bg-white border-l-4 border-red-500',
    warning: 'bg-white border-l-4 border-amber-500',
    info: 'bg-white border-l-4 border-blue-500',
    message: 'bg-white border-l-4 border-indigo-500',
};

export const NotificationToast = () => {
    const { notifications, removeNotification } = useNotification();

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[90%] max-w-sm pointer-events-none">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`${bgColors[notification.type]} shadow-xl rounded-lg p-4 pointer-events-auto animate-slide-down flex items-start gap-3 transform transition-all duration-300`}
                >
                    <div className="shrink-0 mt-0.5">
                        {icons[notification.type] || <Bell className="w-5 h-5 text-slate-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-800">{notification.title}</h4>
                        <p className="text-sm text-slate-600 mt-0.5 leading-tight">{notification.message}</p>
                    </div>
                    <button
                        onClick={() => removeNotification(notification.id)}
                        className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
};
