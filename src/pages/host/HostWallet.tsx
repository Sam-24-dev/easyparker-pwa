import { useState, useMemo } from 'react';
import { HostLayout } from '../../components/host/HostLayout';
import { useHost } from '../../context/HostContext';
import { useParkingContext } from '../../context/ParkingContext';
import {
  ArrowUpRight, ArrowDownLeft, Wallet as WalletIcon,
  ChevronDown, Home, X, Building2, CreditCard, Percent
} from 'lucide-react';

export default function HostWallet() {
  const { transactions, balance } = useHost();
  const { userParkings, claimedParkingIds, parkings } = useParkingContext();

  const [filterParkingId, setFilterParkingId] = useState<number | 'all'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // Obtener garajes del usuario
  const myGarages = useMemo(() => {
    const claimedParkings = parkings.filter(p => claimedParkingIds.includes(p.id));
    return [...userParkings, ...claimedParkings];
  }, [userParkings, claimedParkingIds, parkings]);

  // Filtrar transacciones por garaje
  const filteredTransactions = useMemo(() => {
    if (filterParkingId === 'all') return transactions;
    return transactions.filter(t => t.parkingId === filterParkingId);
  }, [transactions, filterParkingId]);

  // Calcular estadísticas de hoy y esta semana
  const stats = useMemo(() => {
    const now = Date.now();
    const today = new Date().setHours(0, 0, 0, 0);
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const todayEarnings = transactions
      .filter(t => t.type === 'earning' && t.timestamp >= today)
      .reduce((sum, t) => sum + t.amount, 0);

    const weekEarnings = transactions
      .filter(t => t.type === 'earning' && t.timestamp >= weekAgo)
      .reduce((sum, t) => sum + t.amount, 0);

    return { todayEarnings, weekEarnings };
  }, [transactions]);

  // Datos para el gráfico de barras (últimos 7 días)
  const chartData = useMemo(() => {
    const days = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    const now = new Date();
    const result: { day: string; amount: number; isToday: boolean }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayEarnings = transactions
        .filter(t =>
          t.type === 'earning' &&
          t.timestamp >= date.getTime() &&
          t.timestamp < nextDay.getTime()
        )
        .reduce((sum, t) => sum + t.amount, 0);

      result.push({
        day: days[date.getDay()],
        amount: dayEarnings,
        isToday: i === 0
      });
    }

    return result;
  }, [transactions]);

  // Calcular altura máxima para escalar barras
  const maxAmount = Math.max(...chartData.map(d => d.amount), 1);

  // Manejar retiro
  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0 || amount > balance) return;

    // Simular retiro exitoso
    setWithdrawSuccess(true);
    setTimeout(() => {
      setShowWithdrawModal(false);
      setWithdrawSuccess(false);
      setWithdrawAmount('');
    }, 2000);
  };

  return (
    <HostLayout showNav>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-emerald-900">Billetera</h1>
        <p className="text-sm text-slate-500">Gestiona tus ingresos</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 text-white shadow-xl mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <WalletIcon size={20} className="text-white" />
          </div>
          <span className="text-emerald-100 font-medium">Saldo Disponible (neto)</span>
        </div>
        <div className="text-4xl font-bold mb-2">${balance.toFixed(2)}</div>
        <p className="text-xs text-emerald-200 flex items-center gap-1 mb-4">
          <Percent size={12} />
          Después de 10% comisión EasyParker
        </p>

        <button
          onClick={() => setShowWithdrawModal(true)}
          className="w-full py-3 bg-white text-emerald-700 rounded-xl font-semibold hover:bg-emerald-50 transition-colors"
        >
          Retirar Dinero
        </button>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Hoy</p>
          <p className="text-xl font-bold text-emerald-600">${stats.todayEarnings.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Esta semana</p>
          <p className="text-xl font-bold text-emerald-700">${stats.weekEarnings.toFixed(2)}</p>
        </div>
      </div>

      {/* Gráfico de barras - Últimos 7 días */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-4">
        <h3 className="font-semibold text-slate-800 mb-4">Ganancias - Últimos 7 días</h3>
        <div className="h-32 flex items-end justify-between gap-2">
          {chartData.map((data, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-full h-24 flex items-end justify-center">
                <div
                  className={`w-full max-w-[32px] rounded-t-lg transition-all ${data.isToday ? 'bg-emerald-500' : 'bg-emerald-200'
                    }`}
                  style={{
                    height: `${Math.max((data.amount / maxAmount) * 100, data.amount > 0 ? 10 : 0)}%`,
                    minHeight: data.amount > 0 ? '8px' : '0'
                  }}
                />
              </div>
              <span className={`text-xs mt-2 ${data.isToday ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                {data.day}
              </span>
              {data.amount > 0 && (
                <span className="text-[10px] text-slate-500">${data.amount.toFixed(0)}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Filtro por garaje */}
      {myGarages.length > 1 && (
        <div className="flex justify-end mb-3">
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
            >
              <Home size={14} />
              {filterParkingId === 'all' ? 'Todos los garajes' : myGarages.find(g => g.id === filterParkingId)?.nombre?.slice(0, 12) || 'Filtrar'}
              <ChevronDown size={14} />
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 min-w-[180px] py-1">
                <button
                  onClick={() => { setFilterParkingId('all'); setShowFilterDropdown(false); }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${filterParkingId === 'all' ? 'text-emerald-600 font-medium' : 'text-slate-600'
                    }`}
                >
                  Todos los garajes
                </button>
                {myGarages.map(g => (
                  <button
                    key={g.id}
                    onClick={() => { setFilterParkingId(g.id); setShowFilterDropdown(false); }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 ${filterParkingId === g.id ? 'text-emerald-600 font-medium' : 'text-slate-600'
                      }`}
                  >
                    {g.foto ? (
                      <img src={g.foto} alt="" className="w-5 h-5 rounded object-cover" />
                    ) : (
                      <div className="w-5 h-5 rounded bg-slate-100" />
                    )}
                    {g.nombre.length > 15 ? g.nombre.slice(0, 15) + '...' : g.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transacciones */}
      <div>
        <h3 className="font-semibold text-slate-800 mb-4">Actividad Reciente</h3>
        <div className="space-y-3 pb-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 bg-white rounded-2xl border border-slate-100">
              <p>No hay transacciones</p>
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div key={tx.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'earning' ? 'bg-emerald-100' : 'bg-slate-100'
                      }`}>
                      {tx.type === 'earning' ? (
                        <ArrowDownLeft size={20} className="text-emerald-600" />
                      ) : (
                        <ArrowUpRight size={20} className="text-slate-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{tx.description}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{tx.date}</span>
                        {tx.parkingName && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Home size={10} />
                              {tx.parkingName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold ${tx.type === 'earning' ? 'text-emerald-600' : 'text-slate-800'
                      }`}>
                      {tx.type === 'earning' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                    </span>
                    {tx.type === 'earning' && tx.grossAmount && tx.commission && (
                      <p className="text-[10px] text-slate-400">
                        Bruto: ${tx.grossAmount.toFixed(2)} • Com: ${tx.commission.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Retiro */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative">
            <button
              onClick={() => setShowWithdrawModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            {withdrawSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <CreditCard size={32} className="text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Retiro Solicitado</h3>
                <p className="text-slate-500">Se procesará en 1-2 días hábiles</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Building2 size={24} className="text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Retirar Dinero</h3>
                    <p className="text-xs text-slate-500">A tu cuenta bancaria</p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-sm text-slate-600 block mb-2">Monto a retirar</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl text-lg font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Disponible: <span className="font-semibold text-emerald-600">${balance.toFixed(2)}</span>
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl mb-4">
                  <p className="text-xs text-slate-500 mb-1">Cuenta destino (demo)</p>
                  <p className="font-medium text-slate-700">Banco Guayaquil •••• 4521</p>
                </div>

                <button
                  onClick={handleWithdraw}
                  disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > balance}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar Retiro
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </HostLayout>
  );
}
