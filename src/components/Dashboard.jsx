import React from 'react';
import { 
  Clock, 
  Coins, 
  Scale, 
  Users, 
  FolderGit2, 
  ExternalLink, 
  Sparkles, 
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { formatCurrency, formatHours, formatPercent, formatDate } from '../utils/format';

export default function Dashboard({
  logs,
  projects,
  partners,
  settings,
  onOpenNewLog,
  onNavigateTab
}) {
  // Calculations
  const hourlyRate = settings.hourlyRate || 15000;

  let rodrigoHours = 0;
  let franciscoHours = 0;
  let jointHours = 0;
  let asyncHours = 0;

  logs.forEach(log => {
    const hrs = Number(log.hours) || 0;
    if (log.mode === 'conjunta' || log.partnerId === 'both') {
      rodrigoHours += hrs;
      franciscoHours += hrs;
      jointHours += hrs;
    } else if (log.partnerId === 'rodrigo') {
      rodrigoHours += hrs;
      asyncHours += hrs;
    } else if (log.partnerId === 'francisco') {
      franciscoHours += hrs;
      asyncHours += hrs;
    }
  });

  const totalEffectiveHours = rodrigoHours + franciscoHours;
  const rodrigoShare = totalEffectiveHours > 0 ? (rodrigoHours / totalEffectiveHours) : 0.5;
  const franciscoShare = totalEffectiveHours > 0 ? (franciscoHours / totalEffectiveHours) : 0.5;

  const totalValuation = totalEffectiveHours * hourlyRate;
  const rodrigoValuation = rodrigoHours * hourlyRate;
  const franciscoValuation = franciscoHours * hourlyRate;

  // Project breakdown
  const projectStats = projects.map(proj => {
    let projRodrigoHrs = 0;
    let projFranciscoHrs = 0;
    let projTotalHrs = 0;

    logs.filter(l => l.projectId === proj.id).forEach(l => {
      const hrs = Number(l.hours) || 0;
      if (l.mode === 'conjunta' || l.partnerId === 'both') {
        projRodrigoHrs += hrs;
        projFranciscoHrs += hrs;
        projTotalHrs += (hrs * 2);
      } else if (l.partnerId === 'rodrigo') {
        projRodrigoHrs += hrs;
        projTotalHrs += hrs;
      } else if (l.partnerId === 'francisco') {
        projFranciscoHrs += hrs;
        projTotalHrs += hrs;
      }
    });

    return {
      ...proj,
      rodrigoHours: projRodrigoHrs,
      franciscoHours: projFranciscoHrs,
      totalHours: projTotalHrs,
      valuation: projTotalHrs * hourlyRate,
      percentage: totalEffectiveHours > 0 ? (projTotalHrs / totalEffectiveHours) : 0
    };
  }).sort((a, b) => b.totalHours - a.totalHours);

  // Recent logs
  const recentLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const diffPercentage = Math.abs(rodrigoShare - franciscoShare) * 100;
  const isBalanced = diffPercentage <= 15;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Motivation */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 border border-slate-700/80 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Tarifa Vigente: {formatCurrency(hourlyRate, settings.currency)} / hora
              </span>
              <span className="text-xs text-slate-400">• Modelo Igualitario 50/50</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Valorización de Aportes y Jornadas
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Monitoreo transparente del tiempo invertido por Rodrigo y Francisco en la construcción de GeoConecta. Todo aporte individual o conjunto suma al patrimonio de la sociedad.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('liquidator')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2 shadow"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Simular Reparto</span>
            </button>
            <button
              onClick={onOpenNewLog}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>+ Registrar Avance</span>
            </button>
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Horas */}
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Horas Acumuladas</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatHours(totalEffectiveHours)}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Sesiones conjuntas: <b className="text-slate-200">{formatHours(jointHours)}</b></span>
            <span>Asíncronas: <b className="text-slate-200">{formatHours(asyncHours)}</b></span>
          </div>
        </div>

        {/* Valorización Total */}
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Valorización en Trabajo</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {formatCurrency(totalValuation, settings.currency)}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Sweat equity total acumulado por ambos socios.
          </p>
        </div>

        {/* Aporte Rodrigo */}
        <div className="bg-slate-800/70 border border-emerald-500/30 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-base">👨‍💻</span>
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Rodrigo</span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
              {formatPercent(rodrigoShare)}
            </span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatHours(rodrigoHours)}
          </div>
          <div className="mt-2 text-xs text-emerald-400 font-medium">
            Valorizado: {formatCurrency(rodrigoValuation, settings.currency)}
          </div>
        </div>

        {/* Aporte Francisco */}
        <div className="bg-slate-800/70 border border-indigo-500/30 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-base">⚡</span>
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Francisco</span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
              {formatPercent(franciscoShare)}
            </span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatHours(franciscoHours)}
          </div>
          <div className="mt-2 text-xs text-indigo-400 font-medium">
            Valorizado: {formatCurrency(franciscoValuation, settings.currency)}
          </div>
        </div>

      </div>

      {/* Relación de Esfuerzo (Balance / Sweat Equity) */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-400" />
              Equilibrio y Ponderación de Aportes
            </h2>
            <p className="text-xs text-slate-400">
              Comparativa porcentual del trabajo aportado a la fecha para asegurar equidad en la sociedad.
            </p>
          </div>
          <div>
            {isBalanced ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Sociedad Balanceada (&lt; 15% de brecha)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                <TrendingUp className="w-3.5 h-3.5" />
                Mayor carga actual: {rodrigoShare > franciscoShare ? 'Rodrigo' : 'Francisco'}
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar Split */}
        <div className="space-y-2">
          <div className="h-6 w-full rounded-xl overflow-hidden bg-slate-700/60 flex p-1">
            <div 
              style={{ width: `${Math.max(5, rodrigoShare * 100)}%` }}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 h-full rounded-lg transition-all duration-500 flex items-center justify-center text-[11px] font-bold text-white"
            >
              {rodrigoShare > 0.15 ? `Rodrigo ${formatPercent(rodrigoShare)}` : ''}
            </div>
            <div 
              style={{ width: `${Math.max(5, franciscoShare * 100)}%` }}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-lg transition-all duration-500 flex items-center justify-center text-[11px] font-bold text-white"
            >
              {franciscoShare > 0.15 ? `Francisco ${formatPercent(franciscoShare)}` : ''}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span>Rodrigo: <b className="text-white">{formatHours(rodrigoHours)}</b> ({formatPercent(rodrigoShare)})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
              <span>Francisco: <b className="text-white">{formatHours(franciscoHours)}</b> ({formatPercent(franciscoShare)})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Proyectos Activos & Últimos Avances */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Proyectos Activos (2 cols) */}
        <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-emerald-400" />
                Dedicación por Área y Proyecto
              </h2>
              <p className="text-xs text-slate-400">Distribución de horas y valor acumulado por frente de trabajo.</p>
            </div>
            <span className="text-xs text-slate-400 font-medium">{projectStats.length} áreas activas</span>
          </div>

          <div className="space-y-4">
            {projectStats.map(p => (
              <div key={p.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 mr-2">
                      {p.category}
                    </span>
                    <span className="font-semibold text-white text-sm">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-400">{formatHours(p.totalHours)}</span>
                    <span className="text-xs text-slate-400 ml-2">({formatCurrency(p.valuation, settings.currency)})</span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${p.percentage * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <p className="line-clamp-1 max-w-xs">{p.description}</p>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-emerald-300">R: {formatHours(p.rodrigoHours)}</span>
                    <span className="text-indigo-300">F: {formatHours(p.franciscoHours)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Últimos Avances Registrados (1 col) */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                Últimos Avances
              </h2>
              <button
                onClick={() => onNavigateTab('logs')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                Ver todos
              </button>
            </div>

            <div className="space-y-3">
              {recentLogs.map(log => {
                const isJoint = log.mode === 'conjunta' || log.partnerId === 'both';
                return (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-full font-semibold ${
                        isJoint 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : log.partnerId === 'rodrigo'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-indigo-500/10 text-indigo-400'
                      }`}>
                        {isJoint ? '👥 Sesión Conjunta' : log.partnerName}
                      </span>
                      <span className="font-bold text-white">{formatHours(log.hours)}</span>
                    </div>

                    <p className="text-slate-300 font-medium line-clamp-2">
                      {log.description}
                    </p>

                    <div className="flex items-center justify-between text-slate-500 pt-1">
                      <span>{formatDate(log.date)}</span>
                      {log.deliverableUrl && (
                        <a 
                          href={log.deliverableUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-emerald-400 hover:underline"
                        >
                          <span>Entregable</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700/60 text-center">
            <button
              onClick={onOpenNewLog}
              className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <span>+ Registrar Avance de Hoy</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
