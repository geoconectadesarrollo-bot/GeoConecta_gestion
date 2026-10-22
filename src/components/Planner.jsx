import React, { useState } from 'react';
import { 
  CalendarDays, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Plus, 
  Check, 
  Flame,
  MessageSquareQuote
} from 'lucide-react';
import { formatDate } from '../utils/format';

const DAYS = [
  { id: 'lunes', label: 'Lunes' },
  { id: 'martes', label: 'Martes' },
  { id: 'miercoles', label: 'Miércoles' },
  { id: 'jueves', label: 'Jueves' },
  { id: 'viernes', label: 'Viernes' },
  { id: 'sabado', label: 'Sábado' },
];

const BLOCKS = [
  { id: 'morning', label: 'Mañana', time: '09:00 - 13:00' },
  { id: 'afternoon', label: 'Tarde', time: '14:00 - 18:00' },
  { id: 'night', label: 'Noche', time: '19:00 - 22:00' },
];

export default function Planner({
  tasks,
  onAddTask,
  onToggleTask,
  availability,
  onToggleAvailability,
  projects,
  currentPartner
}) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('rodrigo');
  const [projectId, setProjectId] = useState(projects[0]?.id || 'p1');
  const [dueDate, setDueDate] = useState('');
  const [isHandoff, setIsHandoff] = useState(false);
  const [handoffNote, setHandoffNote] = useState('');

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      assignedTo,
      dueDate: dueDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      projectId,
      status: 'pending',
      isHandoff,
      handoffNote: isHandoff ? handoffNote.trim() : ''
    };

    onAddTask(newTask);
    setNewTaskTitle('');
    setHandoffNote('');
    setIsHandoff(false);
  };

  // Find joint match slots
  const matches = [];
  DAYS.forEach(day => {
    BLOCKS.forEach(block => {
      const rAvailable = availability.rodrigo?.[day.id]?.includes(block.id);
      const fAvailable = availability.francisco?.[day.id]?.includes(block.id);
      if (rAvailable && fAvailable) {
        matches.push({ day: day.label, block: block.label, time: block.time });
      }
    });
  });

  return (
    <div className="space-y-8">
      
      {/* Intro Header */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Coordinación Sincrónica & Asincrónica
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-400" />
            Planificación de Jornadas y Postas
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Si coinciden en tiempo, agendan sesiones de trabajo conjunto. Si sus horarios no coinciden, se pasan la posta mediante compromisos claros para que el proyecto nunca se detenga.
          </p>
        </div>

        {/* Match Counter Badge */}
        <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-700">
          <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
          <div className="text-left text-xs">
            <span className="text-slate-400 block font-medium">Bloques de coincidencia:</span>
            <span className="text-sm font-bold text-emerald-400">{matches.length} espacios para sesión juntos</span>
          </div>
        </div>
      </div>

      {/* Matriz de Disponibilidad Semanal */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Semáforo de Disponibilidad Semanal
            </h3>
            <p className="text-xs text-slate-400">
              Haz clic en cualquier casilla para activar o desactivar tu disponibilidad. Las celdas doradas indican coincidencia de ambos.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded bg-emerald-600 inline-block" /> Rodrigo
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded bg-indigo-600 inline-block" /> Francisco
            </span>
            <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <span className="w-3 h-3 rounded bg-amber-500 inline-block" /> 🔥 Ambos libres
            </span>
          </div>
        </div>

        {/* Availability Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="py-2.5 px-3 font-semibold uppercase">Bloque Horario</th>
                {DAYS.map(day => (
                  <th key={day.id} className="py-2.5 px-3 font-semibold text-center uppercase tracking-wider text-slate-300">
                    {day.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {BLOCKS.map(block => (
                <tr key={block.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-300 whitespace-nowrap">
                    <div>{block.label}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{block.time}</div>
                  </td>

                  {DAYS.map(day => {
                    const rAvail = availability.rodrigo?.[day.id]?.includes(block.id);
                    const fAvail = availability.francisco?.[day.id]?.includes(block.id);
                    const isBoth = rAvail && fAvail;

                    return (
                      <td key={day.id} className="py-2 px-2 text-center">
                        <div className={`p-2 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${
                          isBoth 
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-500/10'
                            : 'bg-slate-900/70 border-slate-800'
                        }`}>
                          {isBoth && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-0.5">
                              <Flame className="w-3 h-3 text-amber-400" /> ¡Juntos!
                            </span>
                          )}

                          <div className="flex items-center gap-1.5">
                            {/* Rodrigo toggle */}
                            <button
                              onClick={() => onToggleAvailability('rodrigo', day.id, block.id)}
                              title={`Rodrigo: ${rAvail ? 'Disponible' : 'No disponible'}`}
                              className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                                rAvail
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'bg-slate-800 text-slate-600 hover:text-slate-400'
                              }`}
                            >
                              R
                            </button>

                            {/* Francisco toggle */}
                            <button
                              onClick={() => onToggleAvailability('francisco', day.id, block.id)}
                              title={`Francisco: ${fAvail ? 'Disponible' : 'No disponible'}`}
                              className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                                fAvail
                                  ? 'bg-indigo-600 text-white shadow-sm'
                                  : 'bg-slate-800 text-slate-600 hover:text-slate-400'
                              }`}
                            >
                              F
                            </button>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Postas Asincrónicas & Tareas de Continuidad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lista de Compromisos / Postas (2 cols) */}
        <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-emerald-400" />
                Compromisos & "Pase de Posta"
              </h3>
              <p className="text-xs text-slate-400">
                Tareas que permiten que uno avance cuando el otro no puede estar en vivo.
              </p>
            </div>
            <span className="text-xs text-slate-400">
              {tasks.filter(t => t.status !== 'completed').length} pendientes
            </span>
          </div>

          <div className="space-y-3">
            {tasks.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No hay tareas o postas pendientes.</p>
            ) : (
              tasks.map(task => {
                const isCompleted = task.status === 'completed';
                const proj = projects.find(p => p.id === task.projectId);

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isCompleted 
                        ? 'bg-slate-900/40 border-slate-800/60 opacity-60' 
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'border-slate-600 hover:border-emerald-400 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>

                        <div>
                          <p className={`text-sm font-semibold text-white ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                            {task.title}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-400">
                            {proj && (
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                                {proj.name}
                              </span>
                            )}

                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              Plazo: {formatDate(task.dueDate)}
                            </span>

                            {/* Assigned to badge */}
                            <span className={`px-2 py-0.5 rounded font-semibold ${
                              task.assignedTo === 'rodrigo'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : task.assignedTo === 'francisco'
                                ? 'bg-indigo-500/10 text-indigo-400'
                                : 'bg-slate-700 text-slate-300'
                            }`}>
                              {task.assignedTo === 'rodrigo' ? '👨‍💻 Rodrigo' : task.assignedTo === 'francisco' ? '⚡ Francisco' : '👥 Ambos'}
                            </span>
                          </div>

                          {/* Posta Note */}
                          {task.isHandoff && task.handoffNote && (
                            <div className="mt-2.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2">
                              <MessageSquareQuote className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-amber-300 block mb-0.5">Nota de entrega (Pase de posta):</span>
                                <span>{task.handoffNote}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Formulario Nueva Tarea / Posta (1 col) */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
            <Plus className="w-4 h-4 text-emerald-400" />
            Crear Compromiso / Posta
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Deja claro qué se debe avanzar para que tu socio lo retome en su próximo espacio libre.
          </p>

          <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Título del Compromiso
              </label>
              <input
                type="text"
                placeholder="Ej: Preparar cotización para cliente Minera..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Responsable
                </label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="rodrigo">Rodrigo</option>
                  <option value="francisco">Francisco</option>
                  <option value="both">Ambos (Sesión)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Plazo Tentativo
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Proyecto / Área
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Checkbox Pase de posta */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={isHandoff}
                  onChange={(e) => setIsHandoff(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                />
                <span className="font-semibold text-emerald-400">¿Es un "pase de posta" para continuar?</span>
              </label>
            </div>

            {isHandoff && (
              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Indicaciones para el socio que continúa
                </label>
                <textarea
                  rows="3"
                  placeholder="Ej: Te dejé el borrador en la carpeta comercial, falta que agregues el desglose de tarifas..."
                  value={handoffNote}
                  onChange={(e) => setHandoffNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/30 active:scale-95 flex items-center justify-center gap-2 mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Guardar Tarea / Posta</span>
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
