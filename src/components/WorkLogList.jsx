import React, { useState } from 'react';
import { 
  Clock, 
  Search, 
  Filter, 
  ExternalLink, 
  Trash2, 
  Download, 
  Users, 
  Calendar,
  Layers
} from 'lucide-react';
import { formatCurrency, formatHours, formatDate } from '../utils/format';

export default function WorkLogList({
  logs,
  projects,
  partners,
  settings,
  onDeleteLog,
  onOpenNewLog
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartnerFilter, setSelectedPartnerFilter] = useState('all');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('all');
  const [selectedModeFilter, setSelectedModeFilter] = useState('all');

  const hourlyRate = settings.hourlyRate || 15000;

  // Filter logic
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.projectName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPartner = selectedPartnerFilter === 'all' 
      ? true 
      : selectedPartnerFilter === 'both' 
        ? (log.mode === 'conjunta' || log.partnerId === 'both')
        : log.partnerId === selectedPartnerFilter;

    const matchesProject = selectedProjectFilter === 'all'
      ? true
      : log.projectId === selectedProjectFilter;

    const matchesMode = selectedModeFilter === 'all'
      ? true
      : log.mode === selectedModeFilter;

    return matchesSearch && matchesPartner && matchesProject && matchesMode;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  // Totals for filtered view
  const totalFilteredHours = filteredLogs.reduce((acc, log) => {
    const h = Number(log.hours) || 0;
    return acc + (log.mode === 'conjunta' || log.partnerId === 'both' ? (h * 2) : h);
  }, 0);

  const totalFilteredValuation = totalFilteredHours * hourlyRate;

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Fecha', 'Socio', 'Modalidad', 'Proyecto', 'Horas', 'Tarifa_CLP', 'Valorizacion_CLP', 'Descripcion', 'Entregable_URL'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.date,
      l.partnerName,
      l.mode,
      `"${l.projectName.replace(/"/g, '""')}"`,
      l.hours,
      l.rateAtTime || hourlyRate,
      (l.mode === 'conjunta' || l.partnerId === 'both' ? l.hours * 2 : l.hours) * (l.rateAtTime || hourlyRate),
      `"${l.description.replace(/"/g, '""')}"`,
      `"${l.deliverableUrl || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GeoConecta_Bitacora_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            Bitácora de Horas & Jornadas
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Registro transparente e inmutable de las jornadas realizadas por Rodrigo y Francisco.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2"
            title="Exportar a Excel / CSV"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={onOpenNewLog}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/30"
          >
            <span>+ Nueva Jornada</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar en descripción o proyecto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Socio Filter */}
        <div>
          <select
            value={selectedPartnerFilter}
            onChange={(e) => setSelectedPartnerFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todos los socios</option>
            <option value="both">👥 Sesiones Conjuntas</option>
            <option value="rodrigo">👨‍💻 Solo Rodrigo</option>
            <option value="francisco">⚡ Solo Francisco</option>
          </select>
        </div>

        {/* Project Filter */}
        <div>
          <select
            value={selectedProjectFilter}
            onChange={(e) => setSelectedProjectFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todas las áreas</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Modalidad Filter */}
        <div>
          <select
            value={selectedModeFilter}
            onChange={(e) => setSelectedModeFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todas las modalidades</option>
            <option value="conjunta">Sesión Sincrónica (Juntos)</option>
            <option value="individual">Avance Asincrónico (Individual)</option>
          </select>
        </div>

      </div>

      {/* Filter Summary Stats */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-2">
        <span>Mostrando <b className="text-white">{filteredLogs.length}</b> registros</span>
        <div className="flex items-center gap-4">
          <span>Horas filtradas: <b className="text-white">{formatHours(totalFilteredHours)}</b></span>
          <span>Valorización: <b className="text-emerald-400 font-bold">{formatCurrency(totalFilteredValuation, settings.currency)}</b></span>
        </div>
      </div>

      {/* Table / Cards List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/40 border border-slate-800 rounded-2xl">
            <Clock className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No se encontraron jornadas con estos filtros.</p>
            <p className="text-xs text-slate-500 mt-1">Prueba cambiando los filtros o registra una nueva jornada.</p>
          </div>
        ) : (
          filteredLogs.map(log => {
            const isJoint = log.mode === 'conjunta' || log.partnerId === 'both';
            const logValuation = (isJoint ? log.hours * 2 : log.hours) * (log.rateAtTime || hourlyRate);

            return (
              <div
                key={log.id}
                className="bg-slate-800/70 border border-slate-700/60 hover:border-slate-600 rounded-xl p-4 sm:p-5 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Section: Details */}
                <div className="space-y-2 flex-1">
                  
                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {formatDate(log.date)}
                    </span>

                    {/* Partner badge */}
                    <span className={`px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                      isJoint
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : log.partnerId === 'rodrigo'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}>
                      {isJoint ? '👥 Sesión Conjunta' : log.partnerId === 'rodrigo' ? '👨‍💻 Rodrigo' : '⚡ Francisco'}
                    </span>

                    {/* Project tag */}
                    <span className="px-2 py-0.5 rounded bg-slate-700/70 text-slate-300 border border-slate-600/60 font-medium">
                      {log.projectName}
                    </span>

                    {/* Mode tag */}
                    <span className="text-[11px] text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded">
                      {log.mode === 'conjunta' ? 'Sincrónico' : 'Asincrónico'}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-200 leading-relaxed font-normal">
                    {log.description}
                  </p>

                  {/* Deliverable Link if present */}
                  {log.deliverableUrl && (
                    <div className="pt-1">
                      <a
                        href={log.deliverableUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Ver entregable / carpeta de respaldo</span>
                      </a>
                    </div>
                  )}

                </div>

                {/* Right Section: Hours, Valuation and Actions */}
                <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-700/60 shrink-0">
                  <div className="text-left md:text-right">
                    <div className="text-base font-extrabold text-white">
                      {formatHours(log.hours)} {isJoint && <span className="text-xs text-slate-400 font-normal">(x2 socios)</span>}
                    </div>
                    <div className="text-xs font-semibold text-emerald-400">
                      {formatCurrency(logValuation, settings.currency)}
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteLog(log.id)}
                    title="Eliminar registro"
                    className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
