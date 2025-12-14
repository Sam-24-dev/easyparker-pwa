import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { NOTIFICATION_AUDIO_SRC } from '../data/sounds';

export type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'message';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    duration?: number;
}

interface NotificationContextType {
    notifications: Notification[];
    showNotification: (params: Omit<Notification, 'id'>) => void;
    removeNotification: (id: string) => void;
    playNotificationSound: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio
    if (!audioRef.current) {
        audioRef.current = new Audio(NOTIFICATION_AUDIO_SRC);
        audioRef.current.volume = 0.6;
    }

    const playNotificationSound = useCallback(() => {
        if (audioRef.current) {
            // Reset time to allow rapid replay
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.warn('Audio play failed:', e));
        }
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const showNotification = useCallback(({ title, message, type, duration = 4000 }: Omit<Notification, 'id'>) => {
        const id = Date.now().toString();

        // Add to queue
        setNotifications(prev => [...prev, { id, title, message, type, duration }]);

        // Play sound for important notifications
        if (type !== 'info') {
            playNotificationSound();
        }

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }
    }, [playNotificationSound, removeNotification]);

    return (
        <NotificationContext.Provider value={{ notifications, showNotification, removeNotification, playNotificationSound }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
