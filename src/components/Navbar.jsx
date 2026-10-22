import React from 'react';
import { 
  Compass, 
  UserCheck, 
  LayoutDashboard, 
  Clock, 
  FileText, 
  CalendarDays, 
  Coins, 
  Settings, 
  PlusCircle,
  Users
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  currentPartner, 
  setCurrentPartner, 
  partners, 
  onOpenNewLog, 
  onOpenSettings,
  totalHours,
  totalValuation
}) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">Geo<span className="text-emerald-400">Conecta</span></span>
                <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Socios
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Gestión Interna, Jornadas y Valorización</p>
            </div>
          </div>

          {/* Partner Selector */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60 shadow-inner">
            <span className="text-xs text-slate-400 pl-2 hidden md:inline font-medium">Actuando como:</span>
            
            <button
              onClick={() => setCurrentPartner('both')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentPartner === 'both'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Ambos</span>
            </button>

            {partners.map(p => {
              const isActive = currentPartner === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setCurrentPartner(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? p.id === 'rodrigo'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <span>{p.avatar}</span>
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Action & Settings */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewLog}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Registrar Jornada</span>
              <span className="sm:hidden">+ Jornada</span>
            </button>

            <button
              onClick={onOpenSettings}
              title="Ajustes y Parámetros"
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/80 transition-all"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800/80 text-xs font-medium no-scrollbar">
          {[
            { id: 'dashboard', label: 'Resumen & Valorización', icon: LayoutDashboard },
            { id: 'logs', label: 'Bitácora de Horas', icon: Clock },
            { id: 'planner', label: 'Planificación & Postas', icon: CalendarDays },
            { id: 'liquidator', label: 'Simulador de Reparto', icon: Coins },
          ].map(tab => {
            const Icon = tab.icon;
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg whitespace-nowrap transition-all ${
                  active 
                    ? 'bg-slate-800 text-emerald-400 font-semibold border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
