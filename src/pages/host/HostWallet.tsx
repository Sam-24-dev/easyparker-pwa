import { HostLayout } from '../../components/host/HostLayout';
import { useHost } from '../../context/HostContext';
import { ArrowUpRight, ArrowDownLeft, Wallet as WalletIcon } from 'lucide-react';

export default function HostWallet() {
  const { stats, transactions } = useHost();

  return (
    <HostLayout showNav>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-emerald-900">Billetera</h1>
        <p className="text-sm text-slate-500">Gestiona tus ingresos</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 text-white shadow-xl mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <WalletIcon size={20} className="text-white" />
          </div>
          <span className="text-emerald-100 font-medium">Saldo Disponible</span>
        </div>
        <div className="text-4xl font-bold mb-6">${stats.earnings.toFixed(2)}</div>
        
        <button className="w-full py-3 bg-white text-emerald-700 rounded-xl font-semibold hover:bg-emerald-50 transition-colors">
          Retirar Dinero
        </button>
      </div>

      {/* Gráfico Semanal Simplificado */}
      <div className="mb-6">
        <h3 className="font-semibold text-slate-800 mb-4">Resumen Semanal</h3>
        <div className="h-32 flex items-end justify-between gap-2 px-2 bg-white rounded-2xl p-4 border border-slate-100">
          {[40, 65, 30, 85, 50, 90, 60].map((height, i) => (
            <div key={i} className="w-full bg-emerald-100 rounded-t-lg relative">
              <div 
                className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-t-lg transition-all hover:bg-emerald-600"
                style={{ height: `${height}%` }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400 px-2">
          <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
        </div>
      </div>

      {/* Transacciones */}
      <div>
        <h3 className="font-semibold text-slate-800 mb-4">Actividad Reciente</h3>
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'earning' ? 'bg-emerald-100' : 'bg-slate-100'
                }`}>
                  {tx.type === 'earning' ? (
                    <ArrowDownLeft size={20} className="text-emerald-600" />
                  ) : (
                    <ArrowUpRight size={20} className="text-slate-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-800 text-sm">{tx.description}</p>
                  <p className="text-xs text-slate-400">{tx.date}</p>
                </div>
              </div>
              <span className={`font-bold ${
                tx.type === 'earning' ? 'text-emerald-600' : 'text-slate-800'
              }`}>
                {tx.type === 'earning' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </HostLayout>
  );
}
