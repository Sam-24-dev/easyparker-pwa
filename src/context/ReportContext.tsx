import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IReport, RazonReporte } from '../types';

interface ReportContextType {
    reports: IReport[];
    addReport: (report: Omit<IReport, 'id' | 'fecha' | 'status'>) => void;
    getReportsByUserId: (userId: string) => IReport[];
    hasReportedUser: (reporterId: string, reportedId: string) => boolean;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

const REPORTS_KEY = 'easyparker-reports';

export const RAZONES_REPORTE: { value: RazonReporte; label: string }[] = [
    { value: 'comportamiento_inapropiado', label: 'Comportamiento inapropiado' },
    { value: 'danos_propiedad', label: 'Daños a la propiedad' },
    { value: 'no_se_presento', label: 'No se presentó' },
    { value: 'informacion_falsa', label: 'Información falsa' },
    { value: 'spam', label: 'Spam o publicidad' },
    { value: 'otro', label: 'Otro' },
];

export function ReportProvider({ children }: { children: ReactNode }) {
    const [reports, setReports] = useState<IReport[]>([]);

    useEffect(() => {
        const loadReports = () => {
            try {
                const stored = localStorage.getItem(REPORTS_KEY);
                if (stored) {
                    setReports(JSON.parse(stored));
                }
            } catch (error) {
                console.warn('Error loading reports:', error);
            }
        };
        loadReports();
    }, []);

    const addReport = (reportData: Omit<IReport, 'id' | 'fecha' | 'status'>) => {
        const newReport: IReport = {
            ...reportData,
            id: `report-${Date.now()}`,
            fecha: new Date().toISOString().split('T')[0],
            status: 'pendiente',
        };
        const updatedReports = [...reports, newReport];
        setReports(updatedReports);
        localStorage.setItem(REPORTS_KEY, JSON.stringify(updatedReports));
    };

    const getReportsByUserId = (userId: string): IReport[] => {
        return reports.filter(r => r.reportadoAId === userId);
    };

    const hasReportedUser = (reporterId: string, reportedId: string): boolean => {
        return reports.some(r => r.reportadoPorId === reporterId && r.reportadoAId === reportedId);
    };

    return (
        <ReportContext.Provider value={{
            reports,
            addReport,
            getReportsByUserId,
            hasReportedUser,
        }}>
            {children}
        </ReportContext.Provider>
    );
}

export function useReport() {
    const context = useContext(ReportContext);
    if (!context) {
        throw new Error('useReport debe usarse dentro de ReportProvider');
    }
    return context;
}
