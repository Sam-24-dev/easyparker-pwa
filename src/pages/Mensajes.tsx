import { useState } from 'react';
import { BottomNav } from '../components/layout/BottomNav';
import { ChatFilters, ConversationList } from '../components/chat';

type FilterType = 'all' | 'host' | 'driver' | 'support';

export function Mensajes() {
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');

    return (
        <div className="min-h-[100dvh] bg-[#0A1F63]">
            <div className="max-w-md mx-auto min-h-[100dvh] bg-white flex flex-col shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-white z-40 border-b border-slate-100">
                    <div className="px-4 py-4">
                        <h1 className="text-2xl font-bold text-slate-800">Mensajes</h1>
                    </div>
                </div>

                {/* Contenido */}
                <div className="flex-1 pb-20">
                    {/* Filtros */}
                    <ChatFilters
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                        userType="driver"
                    />

                    {/* Lista de conversaciones */}
                    <ConversationList
                        filter={activeFilter}
                        userType="driver"
                    />
                </div>

                {/* Bottom Navigation */}
                <BottomNav />
            </div>
        </div>
    );
}
