import { useState } from 'react';
import { HostBottomNav } from '../../components/host/HostBottomNav';
import { ChatFilters, ConversationList } from '../../components/chat';

type FilterType = 'all' | 'host' | 'driver' | 'support';

export default function HostMensajes() {
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');

    return (
        <div className="min-h-[100dvh] bg-emerald-900">
            <div className="max-w-md mx-auto min-h-[100dvh] bg-white flex flex-col shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-white z-40 border-b border-slate-200">
                    <div className="px-4 py-4">
                        <h1 className="text-2xl font-bold text-slate-800">Mensajes</h1>
                        <p className="text-sm text-slate-500 mt-1">Chats con tus conductores</p>
                    </div>
                </div>

                {/* Contenido */}
                <div className="flex-1 pb-20">
                    {/* Filtros */}
                    <ChatFilters
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                        userType="host"
                    />

                    {/* Lista de conversaciones */}
                    <ConversationList
                        filter={activeFilter}
                        userType="host"
                    />
                </div>

                {/* Bottom Navigation */}
                <HostBottomNav />
            </div>
        </div>
    );
}
