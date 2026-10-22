import React, { useState } from 'react';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  RotateCw, 
  Eye, 
  EyeOff, 
  Maximize2, 
  Sliders, 
  Layers, 
  Info,
  X
} from 'lucide-react';

export const DEVICE_PRESETS = [
  { id: 'desktop', label: 'Monitor / Laptop', icon: Monitor, width: '100%', height: 'auto', note: 'Escritorio nativo' },
  { id: 'tablet', label: 'iPad / Tablet', icon: Tablet, width: '768px', height: '1024px', note: '768 × 1024 px' },
  { id: 'mobile', label: 'Smartphone (iPhone / Galaxy)', icon: Smartphone, width: '390px', height: '844px', note: '390 × 844 px' },
];

export default function DeviceEmulator({
  isOpen,
  onToggle,
  currentDevice,
  onChangeDevice,
  isLandscape,
  onToggleOrientation,
  scale,
  onChangeScale,
  children
}) {
  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 border border-emerald-500/50 text-emerald-400 font-bold text-xs shadow-2xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 group"
          title="Abrir Emulador de Dispositivos"
        >
          <Smartphone className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
          <span>Emulador de Pantallas</span>
        </button>
      </div>
    );
  }

  const selectedPreset = DEVICE_PRESETS.find(d => d.id === currentDevice) || DEVICE_PRESETS[0];
  const isConstrained = currentDevice !== 'desktop';

  // Calculate viewport dimensions
  let frameWidth = selectedPreset.width;
  let frameHeight = selectedPreset.height;

  if (isConstrained && isLandscape) {
    const temp = frameWidth;
    frameWidth = frameHeight;
    frameHeight = temp;
  }

  return (
    <div className="min-h-screen bg-[#05080e] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* ================= BARRA DE CONTROL DEL EMULADOR ================= */}
      <div className="sticky top-0 z-50 bg-[#090e17] border-b border-emerald-500/30 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xl">
        
        {/* Left: Indicator */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-extrabold text-white text-xs tracking-tight">
            EMULADOR <span className="text-emerald-400">RESPONSIVE</span>
          </span>
          <span className="hidden sm:inline text-[11px] text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
            {selectedPreset.note} {isConstrained && (isLandscape ? '(Horizontal)' : '(Vertical)')}
          </span>
        </div>

        {/* Center: Device Presets Buttons */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          {DEVICE_PRESETS.map(preset => {
            const Icon = preset.icon;
            const isActive = currentDevice === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onChangeDevice(preset.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{preset.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Controls (Orientation, Scale, Close) */}
        <div className="flex items-center gap-2">
          {isConstrained && (
            <button
              onClick={onToggleOrientation}
              className={`p-2 rounded-xl border transition-all flex items-center gap-1 ${
                isLandscape 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
              }`}
              title="Rotar pantalla (Vertical / Horizontal)"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">Rotar</span>
            </button>
          )}

          {isConstrained && (
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2 py-1 rounded-xl text-[11px]">
              <span className="text-slate-500">Zoom:</span>
              {[100, 90, 80].map(s => (
                <button
                  key={s}
                  onClick={() => onChangeScale(s / 100)}
                  className={`px-1.5 py-0.5 rounded font-bold ${
                    scale === (s / 100) ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}%
                </button>
              ))}
            </div>
          )}

          <button
            onClick={onToggle}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all"
            title="Cerrar Emulador (Pantalla Completa)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* ================= MARCO DEL DISPOSITIVO / CANVAS ================= */}
      <div className={`flex-1 flex items-center justify-center p-2 sm:p-6 overflow-auto ${
        isConstrained ? 'bg-[#04060a] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]' : ''
      }`}>
        
        {isConstrained ? (
          /* Phone / Tablet Bezel Frame */
          <div 
            style={{ 
              width: frameWidth, 
              height: frameHeight,
              transform: `scale(${scale})`,
              transformOrigin: 'top center'
            }}
            className="transition-all duration-300 shadow-[0_0_50px_rgba(0,0,0,0.8)] border-[10px] border-slate-800 rounded-[44px] overflow-hidden flex flex-col bg-[#070b12] relative shrink-0 ring-1 ring-slate-700/50"
          >
            {/* Dynamic Island / Speaker Notch (Realistic Mockup) */}
            <div className="w-full h-6 bg-slate-900 flex items-center justify-center relative shrink-0 select-none z-50">
              <div className="w-24 h-4 bg-slate-950 rounded-full flex items-center justify-center gap-1.5 border border-slate-800/60">
                <div className="w-2 h-2 rounded-full bg-slate-900" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800/80" />
              </div>
            </div>

            {/* Application Inside the Frame */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
              {children}
            </div>

            {/* Home Indicator Bar */}
            <div className="w-full h-4 bg-slate-900 flex items-center justify-center shrink-0 select-none z-50">
              <div className="w-32 h-1 bg-slate-700 rounded-full" />
            </div>
          </div>
        ) : (
          /* Full Desktop Width */
          <div className="w-full flex-1 flex flex-col">
            {children}
          </div>
        )}

      </div>

    </div>
  );
}
