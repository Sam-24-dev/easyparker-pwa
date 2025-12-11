import { BadgeCheck } from 'lucide-react';

interface VerifiedBadgeProps {
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export function VerifiedBadge({ size = 'md', showLabel = false }: VerifiedBadgeProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    const textSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    return (
        <div className="inline-flex items-center gap-1 group relative">
            <BadgeCheck
                className={`${sizeClasses[size]} text-blue-500 fill-blue-500`}
            />
            {showLabel && (
                <span className={`${textSizes[size]} font-medium text-blue-600`}>
                    Verificado
                </span>
            )}
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Usuario verificado
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
            </div>
        </div>
    );
}
