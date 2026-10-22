import React, { useState } from 'react';
import { X, Settings, DollarSign, FolderPlus, Download, Upload, RotateCcw, Check, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/format';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  projects,
  onSaveProjects,
  onExportBackup,
  onImportBackup,
  onResetDefault
}) {
  if (!isOpen) return null;

  const [hourlyRate, setHourlyRate] = useState(settings.hourlyRate || 15000);
  const [currency, setCurrency] = useState(settings.currency || 'CLP');
  const [reserveFundPercentage, setReserveFundPercentage] = useState(settings.reserveFundPercentage || 20);

  const [projectList, setProjectList] = useState([...projects]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectCategory, setNewProjectCategory] = useState('Tecnología');

  const handleSave = (e) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      hourlyRate: Number(hourlyRate) || 15000,
      currency,
      reserveFundPercentage: Number(reserveFundPercentage) || 20
    });
    onSaveProjects(projectList);
    onClose();
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newProj = {
      id: `p-${Date.now()}`,
      name: newProjectName.trim(),
      category: newProjectCategory,
      color: '#10b981',
      description: 'Área de trabajo creada por los socios.',
      active: true
    };

    setProjectList([...projectList, newProj]);
    setNewProjectName('');
  };

  const handleDeleteProject = (id) => {
    setProjectList(projectList.filter(p => p.id !== id));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        onImportBackup(parsed);
        alert('¡Copia de seguridad restaurada con éxito!');
        onClose();
      } catch (err) {
        alert('Error al leer el archivo de respaldo. Asegúrate de que sea un JSON válido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Configuración del Sistema</h3>
              <p className="text-xs text-slate-400">Tarifas horarias, áreas de GeoConecta y respaldos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          
          {/* Tarifa y Moneda */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              Valorización y Tarifa Igualitaria
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tarifa por Hora Base ({currency})
                </label>
                <input
                  type="number"
                  step="1000"
                  min="1000"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Moneda
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="CLP">Pesos Chilenos (CLP $)</option>
                  <option value="USD">Dólares (USD $)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Fondo de Reserva GeoConecta sugerido (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={reserveFundPercentage}
                onChange={(e) => setReserveFundPercentage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Gestión de Áreas y Proyectos */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              Áreas de Trabajo y Proyectos
            </h4>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {projectList.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-white font-medium">{p.name}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                      {p.category}
                    </span>
                  </div>
                  {projectList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(p.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Agregar nuevo proyecto */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Nombre de nueva área..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <select
                value={newProjectCategory}
                onChange={(e) => setNewProjectCategory(e.target.value)}
                className="px-2 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Tecnología">Tecnología</option>
                <option value="Negocios">Negocios</option>
                <option value="Gestión">Gestión</option>
                <option value="Operaciones">Operaciones</option>
              </select>
              <button
                type="button"
                onClick={handleAddProject}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl"
              >
                +
              </button>
            </div>
          </div>

          {/* Respaldo y Exportación */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              Respaldo & Seguridad de Datos
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onExportBackup}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Descargar Backup JSON</span>
              </button>

              <label className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Restaurar Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={onResetDefault}
              className="text-[11px] text-slate-500 hover:text-red-400 flex items-center gap-1.5 pt-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer datos demo de ejemplo</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-800/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Cambios</span>
          </button>
        </div>

      </div>
    </div>
  );
}
