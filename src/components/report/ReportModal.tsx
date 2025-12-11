import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { RazonReporte } from '../../types';
import { RAZONES_REPORTE } from '../../context/ReportContext';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (report: { razon: RazonReporte; descripcion?: string }) => void;
    targetName: string;
    // Tipo de reporte: host reporta conductor o conductor reporta anfitrión
    reportType?: 'host_to_driver' | 'driver_to_host';
}

export function ReportModal({ isOpen, onClose, onSubmit, targetName, reportType = 'host_to_driver' }: ReportModalProps) {
    const [razon, setRazon] = useState<RazonReporte | ''>('');
    const [descripcion, setDescripcion] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Títulos y etiquetas según el tipo de reporte
    const isDriverReporting = reportType === 'driver_to_host';
    const modalTitle = isDriverReporting ? 'Reportar anfitrión' : 'Reportar conductor';
    const targetLabel = isDriverReporting ? 'anfitrión' : 'conductor';

    const handleSubmit = async () => {
        if (!razon) return;
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        onSubmit({ razon, descripcion: descripcion.trim() || undefined });
        setIsSubmitting(false);
        setRazon('');
        setDescripcion('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
            <div className="space-y-5">
                {/* Warning header */}
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-amber-800">
                            Estás reportando a {targetName}
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                            Los reportes falsos pueden resultar en la suspensión de tu cuenta.
                        </p>
                    </div>
                </div>

                {/* Razón */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        ¿Por qué reportas a este {targetLabel}?
                    </label>
                    <div className="space-y-2">
                        {RAZONES_REPORTE.map((option) => (
                            <label
                                key={option.value}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${razon === option.value
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="razon"
                                    value={option.value}
                                    checked={razon === option.value}
                                    onChange={() => setRazon(option.value)}
                                    className="w-4 h-4 text-red-600 border-slate-300 focus:ring-red-500"
                                />
                                <span className="text-sm text-slate-700">{option.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Descripción */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Detalles adicionales (opcional)
                    </label>
                    <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Cuéntanos más sobre lo que pasó..."
                        rows={3}
                        maxLength={500}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none resize-none text-slate-800"
                    />
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
                        variant="danger"
                        className="flex-1"
                        onClick={handleSubmit}
                        disabled={!razon || isSubmitting}
                    >
                        {isSubmitting ? 'Enviando...' : 'Enviar reporte'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
