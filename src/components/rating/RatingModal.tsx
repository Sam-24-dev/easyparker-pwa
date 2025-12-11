import { useState } from 'react';
import { Star } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: { estrellas: 1 | 2 | 3 | 4 | 5; comentario?: string }) => void;
    targetName: string;
    tipo: 'garaje' | 'conductor' | 'anfitrion';
}

export function RatingModal({ isOpen, onClose, onSubmit, targetName, tipo }: RatingModalProps) {
    const [estrellas, setEstrellas] = useState<1 | 2 | 3 | 4 | 5>(5);
    const [hoverEstrellas, setHoverEstrellas] = useState<number | null>(null);
    const [comentario, setComentario] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay
        onSubmit({ estrellas, comentario: comentario.trim() || undefined });
        setIsSubmitting(false);
        setEstrellas(5);
        setComentario('');
        onClose();
    };

    const getEstrellasLabel = (num: number) => {
        const labels: Record<number, string> = {
            1: 'Muy malo',
            2: 'Malo',
            3: 'Regular',
            4: 'Bueno',
            5: 'Excelente',
        };
        return labels[num] || '';
    };

    const getTipoLabel = () => {
        const labels = { garaje: 'garaje', conductor: 'conductor', anfitrion: 'anfitrión' };
        return labels[tipo];
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Calificar ${getTipoLabel()}`}>
            <div className="space-y-5">
                {/* Header */}
                <div className="text-center">
                    <p className="text-slate-600">
                        ¿Cómo fue tu experiencia con <span className="font-semibold text-slate-800">{targetName}</span>?
                    </p>
                </div>

                {/* Estrellas */}
                <div className="flex flex-col items-center gap-2">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((num) => (
                            <button
                                key={num}
                                type="button"
                                onClick={() => setEstrellas(num as 1 | 2 | 3 | 4 | 5)}
                                onMouseEnter={() => setHoverEstrellas(num)}
                                onMouseLeave={() => setHoverEstrellas(null)}
                                className="p-1 transition-transform hover:scale-110"
                            >
                                <Star
                                    size={36}
                                    className={`transition-colors ${(hoverEstrellas !== null ? num <= hoverEstrellas : num <= estrellas)
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-slate-300'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                    <span className="text-sm font-medium text-slate-600">
                        {getEstrellasLabel(hoverEstrellas ?? estrellas)}
                    </span>
                </div>

                {/* Comentario */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Comentario (opcional)
                    </label>
                    <textarea
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        placeholder="Cuéntanos más sobre tu experiencia..."
                        rows={3}
                        maxLength={300}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none text-slate-800"
                    />
                    <p className="text-xs text-slate-400 mt-1 text-right">
                        {comentario.length}/300
                    </p>
                </div>

                {/* Botones */}
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        className="flex-1"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Enviando...' : 'Enviar calificación'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
