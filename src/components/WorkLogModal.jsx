import React, { useState } from 'react';
import { X, Clock, Calendar, Check, Link, Sparkles, Users, User } from 'lucide-react';
import { formatCurrency } from '../utils/format';

export default function WorkLogModal({
  isOpen,
  onClose,
  onSave,
  projects,
  partners,
  settings,
  defaultPartner = 'rodrigo'
}) {
  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(today);
  const [partnerMode, setPartnerMode] = useState(defaultPartner === 'both' ? 'both' : defaultPartner);
  const [projectId, setProjectId] = useState(projects[0]?.id || 'p1');
  const [hours, setHours] = useState(2.0);
  const [description, setDescription] = useState('');
  const [deliverableUrl, setDeliverableUrl] = useState('');

  const hourlyRate = settings.hourlyRate || 15000;
  const isJoint = partnerMode === 'both';
  const calculatedValuation = isJoint ? (hours * 2 * hourlyRate) : (hours * hourlyRate);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim() || hours <= 0) return;

    const selectedProj = projects.find(p => p.id === projectId);

    const newLog = {
      id: `log-${Date.now()}`,
      date,
      partnerId: partnerMode,
      partnerName: partnerMode === 'both' ? 'Rodrigo & Francisco' : partners.find(p => p.id === partnerMode)?.name || 'Socio',
      mode: partnerMode === 'both' ? 'conjunta' : 'individual',
      projectId,
      projectName: selectedProj ? selectedProj.name : 'Proyecto',
      hours: Number(hours),
      description: description.trim(),
      deliverableUrl: deliverableUrl.trim(),
      rateAtTime: hourlyRate,
      status: 'approved',
      createdAt: new Date().toISOString()
    };

    onSave(newLog);
    onClose();
  };

  const quickHours = [1, 1.5, 2, 2.5, 3, 4, 6];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Registrar Nueva Jornada</h3>
              <p className="text-xs text-slate-400">Agrega el tiempo y entregables de tu sesión de trabajo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          {/* Modalidad / Quién trabajó */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              ¿Quién participó en la jornada?
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPartnerMode('both')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  partnerMode === 'both'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700/50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>👥 Ambos (Conjunta)</span>
              </button>

              <button
                type="button"
                onClick={() => setPartnerMode('rodrigo')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  partnerMode === 'rodrigo'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700/50'
                }`}
              >
                <span>👨‍💻 Rodrigo</span>
              </button>

              <button
                type="button"
                onClick={() => setPartnerMode('francisco')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  partnerMode === 'francisco'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700/50'
                }`}
              >
                <span>⚡ Francisco</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              {partnerMode === 'both' 
                ? '⭐ Sesión colaborativa: suma horas simultáneamente para ambos socios.'
                : '⭐ Avance asincrónico: suma horas a quien ejecutó la tarea en su disponibilidad.'}
            </p>
          </div>

          {/* Fecha & Proyecto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Fecha
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Área / Proyecto
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Horas trabajadas */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Horas Dedicadas
              </label>
              <span className="text-xs font-bold text-emerald-400">
                {hours} hrs ({formatCurrency(calculatedValuation, settings.currency)} en valorización)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.25"
                min="0.25"
                max="24"
                value={hours}
                onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-emerald-500"
                required
              />

              {/* Botones rápidos de horas */}
              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                {quickHours.map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHours(h)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      hours === h
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700/80 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Resumen del avance */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              ¿Qué se avanzó o resolvió?
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Se cerró la propuesta técnica para el cliente X, se mapearon capas de catastro en el prototipo y se corrigieron errores del backend..."
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
              required
            />
          </div>

          {/* Enlace de respaldo / entregable */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Enlace a Entregable / Respaldo (Opcional)</span>
              <span className="text-[11px] text-slate-500 font-normal">Drive, GitHub, Figma, etc.</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={deliverableUrl}
                onChange={(e) => setDeliverableUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <Link className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Valorización Feedback Card */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300">Aporte a incorporar al patrimonio:</span>
            </div>
            <span className="font-bold text-emerald-400 text-sm">
              +{formatCurrency(calculatedValuation, settings.currency)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 active:scale-95 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Guardar en Bitácora</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
