import React, { useState } from 'react';
import { 
  Coins, 
  Calculator, 
  HelpCircle, 
  Scale, 
  DollarSign, 
  ShieldCheck, 
  PieChart, 
  ArrowRight,
  TrendingUp,
  Percent
} from 'lucide-react';
import { formatCurrency, formatHours, formatPercent } from '../utils/format';

export default function Liquidator({
  logs,
  projects,
  partners,
  settings
}) {
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [invoiceAmount, setInvoiceAmount] = useState(3000000); // 3M CLP demo
  const [directCosts, setDirectCosts] = useState(300000); // 300k CLP demo
  const [reserveFundPercent, setReserveFundPercent] = useState(settings.reserveFundPercentage || 20);

  const hourlyRate = settings.hourlyRate || 15000;

  // Filter logs for selected project or all
  const relevantLogs = selectedProjectId === 'all' 
    ? logs 
    : logs.filter(l => l.projectId === selectedProjectId);

  let rodrigoHours = 0;
  let franciscoHours = 0;

  relevantLogs.forEach(log => {
    const hrs = Number(log.hours) || 0;
    if (log.mode === 'conjunta' || log.partnerId === 'both') {
      rodrigoHours += hrs;
      franciscoHours += hrs;
    } else if (log.partnerId === 'rodrigo') {
      rodrigoHours += hrs;
    } else if (log.partnerId === 'francisco') {
      franciscoHours += hrs;
    }
  });

  const totalHours = rodrigoHours + franciscoHours;
  const rodrigoShare = totalHours > 0 ? rodrigoHours / totalHours : 0.5;
  const franciscoShare = totalHours > 0 ? franciscoHours / totalHours : 0.5;

  // Financial calculations
  const grossIncome = Math.max(0, Number(invoiceAmount) || 0);
  const costs = Math.max(0, Number(directCosts) || 0);
  const marginBeforeReserve = Math.max(0, grossIncome - costs);
  const reserveFundAmount = marginBeforeReserve * (Number(reserveFundPercent) / 100);
  const netDistributablePool = Math.max(0, marginBeforeReserve - reserveFundAmount);

  const rodrigoPayout = netDistributablePool * rodrigoShare;
  const franciscoPayout = netDistributablePool * franciscoShare;

  return (
    <div className="space-y-8">
      
      {/* Intro Header */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Transparencia Financiera & Repartos
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-400" />
            Simulador de Liquidación de Proyectos
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Calcula exactamente cuánto dinero le corresponde percibir a Rodrigo y a Francisco cuando ingresa un pago de cliente, basado en las horas reales ejecutadas.
          </p>
        </div>

        <div className="bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-700 text-xs text-right">
          <span className="text-slate-400 block font-medium">Tarifa Base de Referencia:</span>
          <span className="text-base font-bold text-emerald-400">{formatCurrency(hourlyRate, settings.currency)} / hr</span>
        </div>
      </div>

      {/* Main Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Parámetros de la Liquidación (5 cols) */}
        <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" />
            Parámetros del Ingreso a Distribuir
          </h3>

          <div className="space-y-4 text-xs">
            {/* Proyecto */}
            <div>
              <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Proyecto / Origen del Pago
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Todo el trabajo histórico de GeoConecta</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Monto Facturado */}
            <div>
              <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Ingreso Bruto Cobrado al Cliente ({settings.currency})
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="50000"
                  min="0"
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
                <span className="text-slate-400 absolute left-3 top-2.5 font-bold">$</span>
              </div>
            </div>

            {/* Gastos Directos */}
            <div>
              <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Gastos Directos Deducibles</span>
                <span className="text-[11px] text-slate-500 font-normal">Servidores, viáticos, licencias</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="10000"
                  min="0"
                  value={directCosts}
                  onChange={(e) => setDirectCosts(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
                <span className="text-slate-400 absolute left-3 top-2.5 font-bold">$</span>
              </div>
            </div>

            {/* Fondo de Reserva */}
            <div>
              <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Fondo de Reserva para GeoConecta (%)</span>
                <span className="text-emerald-400 font-bold">{reserveFundPercent}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={reserveFundPercent}
                onChange={(e) => setReserveFundPercent(e.target.value)}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Fondo que queda en la cuenta de la empresa para flujo de caja, inversión y contingencias.
              </p>
            </div>

            {/* Resumen del Cálculo Intermedio */}
            <div className="pt-3 border-t border-slate-700/60 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Margen después de gastos:</span>
                <span className="font-semibold text-white">{formatCurrency(marginBeforeReserve, settings.currency)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Fondo retenido por GeoConecta:</span>
                <span className="font-semibold text-amber-400">-{formatCurrency(reserveFundAmount, settings.currency)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-slate-700/40 text-emerald-400">
                <span>Pozo Neto a Repartir:</span>
                <span>{formatCurrency(netDistributablePool, settings.currency)}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Resultados del Reparto (7 cols) */}
        <div className="lg:col-span-7 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-400" />
                Liquidación Justa según Horas Aportadas
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                Total horas base: <b className="text-white">{formatHours(totalHours)}</b>
              </span>
            </div>

            {/* Split cards for Rodrigo & Francisco */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card Rodrigo */}
              <div className="bg-slate-900/80 border-2 border-emerald-500/40 rounded-xl p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👨‍💻</span>
                    <div>
                      <h4 className="font-bold text-white text-sm">Rodrigo</h4>
                      <p className="text-[11px] text-emerald-400 font-semibold">{formatHours(rodrigoHours)} ({formatPercent(rodrigoShare)})</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    {formatPercent(rodrigoShare)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Monto a percibir:</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    {formatCurrency(rodrigoPayout, settings.currency)}
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-400">
                  Equivalente a <b className="text-slate-200">{formatCurrency(rodrigoHours > 0 ? rodrigoPayout / rodrigoHours : 0, settings.currency)}</b> por cada hora trabajada.
                </div>
              </div>

              {/* Card Francisco */}
              <div className="bg-slate-900/80 border-2 border-indigo-500/40 rounded-xl p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚡</span>
                    <div>
                      <h4 className="font-bold text-white text-sm">Francisco</h4>
                      <p className="text-[11px] text-indigo-400 font-semibold">{formatHours(franciscoHours)} ({formatPercent(franciscoShare)})</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                    {formatPercent(franciscoShare)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Monto a percibir:</span>
                  <div className="text-2xl font-black text-indigo-400 mt-1">
                    {formatCurrency(franciscoPayout, settings.currency)}
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-400">
                  Equivalente a <b className="text-slate-200">{formatCurrency(franciscoHours > 0 ? franciscoPayout / franciscoHours : 0, settings.currency)}</b> por cada hora trabajada.
                </div>
              </div>

            </div>

            {/* Split Comparison Bar */}
            <div className="mt-5 space-y-2">
              <div className="h-4 w-full rounded-lg overflow-hidden bg-slate-950 flex p-0.5">
                <div 
                  style={{ width: `${Math.max(5, rodrigoShare * 100)}%` }}
                  className="bg-emerald-500 h-full rounded transition-all"
                />
                <div 
                  style={{ width: `${Math.max(5, franciscoShare * 100)}%` }}
                  className="bg-indigo-500 h-full rounded transition-all"
                />
              </div>

              <div className="flex justify-between text-xs text-slate-400 px-1">
                <span>Rodrigo: {formatPercent(rodrigoShare)}</span>
                <span>Francisco: {formatPercent(franciscoShare)}</span>
              </div>
            </div>
          </div>

          {/* Explicación de la Fórmula y Regla de Paz */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">¿Por qué este método garantiza transparencia?</span>
              <p>
                Nadie siente que trabajó gratis ni que otro se llevó más de lo que aportó. Si una semana Francisco tiene menos disponibilidad por temas personales, Rodrigo avanza sabiendo que su esfuerzo se verá reflejado directamente en el reparto cuando ingrese la facturación.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
