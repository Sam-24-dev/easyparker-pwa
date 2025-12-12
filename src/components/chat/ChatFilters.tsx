interface ChatFiltersProps {
    activeFilter: 'all' | 'host' | 'driver' | 'support';
    onFilterChange: (filter: 'all' | 'host' | 'driver' | 'support') => void;
    userType: 'driver' | 'host';
}

export function ChatFilters({ activeFilter, onFilterChange, userType }: ChatFiltersProps) {
    // Filtros según el tipo de usuario
    const filters = userType === 'driver'
        ? [
            { id: 'all' as const, label: 'Todos' },
            { id: 'driver' as const, label: 'Anfitriones' },
            { id: 'support' as const, label: 'Asistencia' },
        ]
        : [
            { id: 'all' as const, label: 'Todos' },
            { id: 'host' as const, label: 'Conductores' },
            { id: 'support' as const, label: 'Asistencia' },
        ];

    return (
        <div className="px-4 py-3 bg-white border-b border-slate-100">
            <div className="flex gap-2">
                {filters.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => onFilterChange(filter.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === filter.id
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
