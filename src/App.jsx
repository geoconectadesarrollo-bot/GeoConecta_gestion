import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Compass, 
  Sparkles, 
  Clock, 
  Play, 
  Square, 
  Plus, 
  Calendar, 
  ArrowRight, 
  ArrowLeft,
  Coins, 
  Download, 
  Trash2, 
  Check, 
  Flame, 
  Trophy, 
  Zap, 
  Coffee, 
  Target, 
  Rocket, 
  ExternalLink,
  Users,
  Code,
  Briefcase,
  Scale,
  MapPin,
  Menu,
  X,
  ChevronRight,
  Home,
  CheckCircle2,
  DollarSign,
  Video,
  Phone,
  MessageCircle,
  FolderOpen,
  Database,
  Cloud
} from 'lucide-react';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  clearSupabaseConfig, 
  fetchCloudState, 
  pushCloudState, 
  subscribeToCloudState 
} from './services/supabase';
import { 
  INITIAL_PARTNERS, 
  INITIAL_PROJECTS, 
  INITIAL_SETTINGS, 
  INITIAL_LOGS, 
  INITIAL_TASKS,
  INITIAL_AVAILABILITY,
  INITIAL_SCHEDULE 
} from './data/initialData';
import { formatCurrency, formatHours, formatPercent, formatDate } from './utils/format';
import DeviceEmulator from './components/DeviceEmulator';

const STORAGE_KEY = 'geoconecta_home_drawer_v1';

// Days & Time Blocks configuration for Weekly Planning
const DAYS_OF_WEEK = [
  { id: 'lunes', short: 'LUN', label: 'Lunes' },
  { id: 'martes', short: 'MAR', label: 'Martes' },
  { id: 'miercoles', short: 'MIÉ', label: 'Miércoles' },
  { id: 'jueves', short: 'JUE', label: 'Jueves' },
  { id: 'viernes', short: 'VIE', label: 'Viernes' },
  { id: 'sabado', short: 'SÁB', label: 'Sábado' },
  { id: 'domingo', short: 'DOM', label: 'Domingo' }
];

const TIME_BLOCKS = [
  { id: 'morning', label: 'Mañana', emoji: '🌅', range: '09:00 - 13:00', defaultHours: 3.5 },
  { id: 'afternoon', label: 'Tarde', emoji: '☀️', range: '14:00 - 18:00', defaultHours: 3.5 },
  { id: 'night', label: 'Noche', emoji: '🌙', range: '19:00 - 22:00', defaultHours: 2.5 }
];

// Visual Project Icons Map
const PROJECT_ICONS = {
  p1: { icon: Code, label: 'Software', emoji: '💻', bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-400', activeBg: 'bg-emerald-600 text-white' },
  p2: { icon: Briefcase, label: 'Comercial', emoji: '💼', bg: 'bg-indigo-500/15', border: 'border-indigo-500/40', text: 'text-indigo-400', activeBg: 'bg-indigo-600 text-white' },
  p3: { icon: Scale, label: 'Legal/Admin', emoji: '⚖️', bg: 'bg-amber-500/15', border: 'border-amber-500/40', text: 'text-amber-400', activeBg: 'bg-amber-600 text-white' },
  p4: { icon: MapPin, label: 'Terreno', emoji: '🌍', bg: 'bg-cyan-500/15', border: 'border-cyan-500/40', text: 'text-cyan-400', activeBg: 'bg-cyan-600 text-white' },
};


const REAL_PARTNER_CONTACTS = {
  rodrigo: {
    name: 'Rodrigo',
    city: 'Chillán',
    phone: '+56974300363',
    whatsapp: '56974300363',
    meetUrl: 'https://meet.google.com/new',
    driveUrl: 'https://drive.google.com/drive/folders/1_C5niEqMIutU7UCsfAVwxCN5Behdf8ie?usp=drive_link'
  },
  francisco: {
    name: 'Francisco',
    city: 'Concepción',
    phone: '+56994455663',
    whatsapp: '56994455663',
    meetUrl: 'https://meet.google.com/new',
    driveUrl: 'https://drive.google.com/drive/folders/1_C5niEqMIutU7UCsfAVwxCN5Behdf8ie?usp=drive_link'
  }
};

export default function App() {
  // Store
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved); 
        if (!parsed.schedule) parsed.schedule = INITIAL_SCHEDULE;
        if (!parsed.availability) parsed.availability = INITIAL_AVAILABILITY;
        return parsed;
      } catch (e) {}
    }
    return {
      logs: INITIAL_LOGS,
      tasks: INITIAL_TASKS,
      projects: INITIAL_PROJECTS,
      settings: INITIAL_SETTINGS,
      availability: INITIAL_AVAILABILITY,
      schedule: INITIAL_SCHEDULE
    };
  });

  // Current view: 'inicio' (default) | 'jornadas' | 'coordinacion' | 'finanzas' | 'logros'
  const [activeTab, setActiveTab] = useState('inicio');
  const [activePartner, setActivePartner] = useState('rodrigo'); // 'rodrigo' | 'francisco'

  // Form State
  const [logHours, setLogHours] = useState(1);
  const [logMode, setLogMode] = useState('individual'); // 'individual' | 'conjunta'
  const [logProject, setLogProject] = useState('p1');
  const [logSummary, setLogSummary] = useState('');
  const [logUrl, setLogUrl] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);
  const [celebrationToast, setCelebrationToast] = useState(null);

  // Focus Timer
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Postas State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskNote, setTaskNote] = useState('');

  // Reparto Simulator State
  const [invoiceAmount, setInvoiceAmount] = useState(1500000);
  const [directCosts, setDirectCosts] = useState(250000);

  // Scheduler State
  const [selectedDay, setSelectedDay] = useState('martes');
  const [calendarView, setCalendarView] = useState('day'); // 'day' | 'week'
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [partnerContacts, setPartnerContacts] = useState(() => {
    try {
      const saved = localStorage.getItem('geoconecta_partner_contacts_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only use saved if it has the real drive folder link
        if (parsed?.francisco?.phone === '+56994455663' && parsed?.rodrigo?.driveUrl?.includes('1_C5niEqMIutU7UCsfAVwxCN5Behdf8ie')) {
          return parsed;
        }
      }
    } catch (e) {}
    localStorage.setItem('geoconecta_partner_contacts_v1', JSON.stringify(REAL_PARTNER_CONTACTS));
    return REAL_PARTNER_CONTACTS;
  });

  const [editPhone, setEditPhone] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editMeetUrl, setEditMeetUrl] = useState('');
  const [editDriveUrl, setEditDriveUrl] = useState('');

  const otherPartnerId = activePartner === 'rodrigo' ? 'francisco' : 'rodrigo';
  const otherContact = partnerContacts[otherPartnerId] || partnerContacts.francisco;

  const handleOpenEditContact = () => {
    setEditPhone(otherContact.phone);
    setEditWhatsapp(otherContact.whatsapp);
    setEditMeetUrl(otherContact.meetUrl);
    setEditDriveUrl(otherContact.driveUrl);
    setIsContactModalOpen(true);
  };

  const handleSaveContact = (e) => {
    e.preventDefault();
    const updated = {
      ...partnerContacts,
      [otherPartnerId]: {
        ...otherContact,
        phone: editPhone.trim() || otherContact.phone,
        whatsapp: editWhatsapp.trim() || otherContact.whatsapp,
        meetUrl: editMeetUrl.trim() || otherContact.meetUrl,
        driveUrl: editDriveUrl.trim() || otherContact.driveUrl
      }
    };
    setPartnerContacts(updated);
    localStorage.setItem('geoconecta_partner_contacts_v1', JSON.stringify(updated));
    setIsContactModalOpen(false);
    triggerCelebration('¡Canales de contacto actualizados!');
  };
  const [bookingDay, setBookingDay] = useState('martes');
  const [bookingBlock, setBookingBlock] = useState('night');
  const [bookingMode, setBookingMode] = useState('conjunta'); // 'conjunta' | 'individual'
  const [bookingPartner, setBookingPartner] = useState('both');
  const [bookingProject, setBookingProject] = useState('p1');
  const [bookingTitle, setBookingTitle] = useState('');
  const [bookingHours, setBookingHours] = useState(3.0);

  // Emulator State
  const [isEmulatorOpen, setIsEmulatorOpen] = useState(true);
  const [emulatorDevice, setEmulatorDevice] = useState('mobile');
  const [emulatorLandscape, setEmulatorLandscape] = useState(false);
  const [emulatorScale, setEmulatorScale] = useState(0.85);

  // Sync Storage
  // ================= SUPABASE CLOUD SYNC =================
  const [supabaseConfig, setSupabaseConfigState] = useState(getSupabaseConfig);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(supabaseConfig.url || '');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(supabaseConfig.anonKey || '');
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  const isRemoteUpdateRef = useRef(false);
  const dataRef = useRef(data);
  dataRef.current = data;

  // 1. Cargar datos iniciales y escuchar cambios en tiempo real (sin loop de eco)
  useEffect(() => {
    if (!supabaseConfig.isConnected) return;

    let isMounted = true;

    fetchCloudState().then(cloudData => {
      if (!isMounted) return;
      if (cloudData) {
        if (JSON.stringify(cloudData) !== JSON.stringify(dataRef.current)) {
          isRemoteUpdateRef.current = true;
          setData(cloudData);
        }
        console.log('✅ Datos sincronizados desde Supabase');
      } else {
        // Primera vez: subir estado local a la nube
        pushCloudState(dataRef.current);
      }
    });

    const unsubscribe = subscribeToCloudState((remoteData) => {
      if (!isMounted) return;
      // Solo actualizar si hay cambios reales y no hacer echo
      if (JSON.stringify(remoteData) !== JSON.stringify(dataRef.current)) {
        isRemoteUpdateRef.current = true;
        setData(remoteData);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [supabaseConfig.isConnected]);

  // 2. Guardar en localStorage y subir a Supabase con debounce (evitando rebote)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    // Si la actualización provino desde la nube (Realtime), no la rebotamos hacia la nube
    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return;
    }

    if (supabaseConfig.isConnected) {
      setIsCloudSyncing(true);
      const timer = setTimeout(async () => {
        await pushCloudState(data);
        setIsCloudSyncing(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [data, supabaseConfig.isConnected]);

  const handleSaveSupabaseCredentials = (e) => {
    e.preventDefault();
    const config = saveSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
    setSupabaseConfigState(config);
    setIsSupabaseModalOpen(false);
    if (config.isConnected) {
      triggerCelebration('¡Supabase conectado con éxito! ☁️✨');
    }
  };

  const handleDisconnectSupabase = () => {
    clearSupabaseConfig();
    const config = getSupabaseConfig();
    setSupabaseConfigState(config);
    setSupabaseUrlInput('');
    setSupabaseKeyInput('');
    setIsSupabaseModalOpen(false);
    triggerCelebration('Volviste a modo local (localStorage)');
  };

  // Live Timer
  useEffect(() => {
    let int = null;
    if (isTimerRunning) {
      int = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    } else {
      clearInterval(int);
    }
    return () => clearInterval(int);
  }, [isTimerRunning]);

  const formatTimer = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculations
  const hourlyRate = data.settings.hourlyRate || 15000;
  let rHours = 0;
  let fHours = 0;

  data.logs.forEach(l => {
    const h = Number(l.hours) || 0;
    if (l.mode === 'conjunta' || l.partnerId === 'both') {
      rHours += h;
      fHours += h;
    } else if (l.partnerId === 'rodrigo') {
      rHours += h;
    } else if (l.partnerId === 'francisco') {
      fHours += h;
    }
  });

  const totalEffectiveHours = rHours + fHours;
  const rShare = totalEffectiveHours > 0 ? (rHours / totalEffectiveHours) : 0.5;
  const fShare = totalEffectiveHours > 0 ? (fHours / totalEffectiveHours) : 0.5;

  const currentPartnerName = activePartner === 'rodrigo' ? 'Rodrigo' : 'Francisco';
  const partnerCurrentHours = activePartner === 'rodrigo' ? rHours : fHours;
  const partnerCurrentValuation = partnerCurrentHours * hourlyRate;

  // Monthly Target
  const monthlyGoal = 40;
  const goalProgress = Math.min(1, totalEffectiveHours / monthlyGoal);

  // Reparto Math
  const netMargin = Math.max(0, invoiceAmount - directCosts);
  const reserveFund = netMargin * 0.20;
  const distributableNet = Math.max(0, netMargin - reserveFund);
  const rPayout = distributableNet * rShare;
  const fPayout = distributableNet * fShare;

  // Playful Confetti Trigger
  const triggerCelebration = (msg) => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#6366f1', '#f59e0b', '#06b6d4']
      });
    } catch (e) {}
    setCelebrationToast(msg);
    setTimeout(() => setCelebrationToast(null), 3000);
  };

  // Submit Work Log
  const handleSaveLog = (e) => {
    e.preventDefault();
    if (!logSummary.trim()) return;

    const proj = data.projects.find(p => p.id === logProject);
    const addedValue = logHours * hourlyRate * (logMode === 'conjunta' ? 2 : 1);

    const newLog = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      partnerId: logMode === 'conjunta' ? 'both' : activePartner,
      partnerName: logMode === 'conjunta' ? 'Rodrigo & Francisco' : currentPartnerName,
      mode: logMode,
      projectId: logProject,
      projectName: proj ? proj.name : 'General',
      hours: Number(logHours),
      description: logSummary.trim(),
      deliverableUrl: logUrl.trim(),
      rateAtTime: hourlyRate,
      createdAt: new Date().toISOString()
    };

    setData(prev => ({
      ...prev,
      logs: [newLog, ...prev.logs]
    }));

    setLogSummary('');
    setLogUrl('');
    setShowUrlField(false);
    triggerCelebration(`+${formatHours(logHours)} • ${formatCurrency(addedValue)} sumados! 🚀`);
  };

  // Create Task Handoff
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask = {
      id: `task-${Date.now()}`,
      title: taskTitle.trim(),
      assignedTo: activePartner === 'rodrigo' ? 'francisco' : 'rodrigo',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      projectId: logProject,
      status: 'pending',
      isHandoff: true,
      handoffNote: taskNote.trim()
    };

    setData(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks]
    }));

    setTaskTitle('');
    setTaskNote('');
    triggerCelebration(`Posta asignada a ${activePartner === 'rodrigo' ? 'Francisco' : 'Rodrigo'} 🤝`);
  };

  const handleToggleTask = (id) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id === id) {
          const nextStatus = t.status === 'completed' ? 'pending' : 'completed';
          if (nextStatus === 'completed') {
            triggerCelebration('¡Posta completada! 🎯');
          }
          return { ...t, status: nextStatus };
        }
        return t;
      })
    }));
  };

  const PRESET_HOURS = [
    { value: 0.5, label: '30m', icon: Coffee },
    { value: 1.0, label: '1h', icon: Zap },
    { value: 1.5, label: '1.5h', icon: Rocket },
    { value: 2.0, label: '2h', icon: Target },
    { value: 3.0, label: '3h', icon: Trophy },
  ];

  // Schedule Metrics & Calculations
  const scheduleList = data.schedule || [];
  const syncSessions = scheduleList.filter(s => s.mode === 'conjunta');
  const syncHoursTotal = syncSessions.reduce((acc, s) => acc + (Number(s.hoursEst) || 0), 0);
  const rScheduledHours = scheduleList
    .filter(s => s.mode === 'individual' && s.partnerId === 'rodrigo')
    .reduce((acc, s) => acc + (Number(s.hoursEst) || 0), 0);
  const fScheduledHours = scheduleList
    .filter(s => s.mode === 'individual' && s.partnerId === 'francisco')
    .reduce((acc, s) => acc + (Number(s.hoursEst) || 0), 0);

  // Free sync opportunities (where both are available but no session booked yet)
  let freeSyncOpportunities = 0;
  DAYS_OF_WEEK.forEach(day => {
    TIME_BLOCKS.forEach(block => {
      const rAvail = data.availability?.rodrigo?.[day.id]?.includes(block.id);
      const fAvail = data.availability?.francisco?.[day.id]?.includes(block.id);
      const isAlready = scheduleList.some(s => s.day === day.id && s.block === block.id);
      if (rAvail && fAvail && !isAlready) {
        freeSyncOpportunities += 1;
      }
    });
  });

  // Toggle availability for current active partner
  const handleToggleMyAvailability = (dayId, blockId) => {
    setData(prev => {
      const currentList = prev.availability?.[activePartner]?.[dayId] || [];
      const isAlready = currentList.includes(blockId);
      const updatedList = isAlready 
        ? currentList.filter(b => b !== blockId)
        : [...currentList, blockId];
      
      const otherPartner = activePartner === 'rodrigo' ? 'francisco' : 'rodrigo';
      const otherHas = prev.availability?.[otherPartner]?.[dayId]?.includes(blockId);

      if (!isAlready && otherHas) {
        triggerCelebration(`¡Coincidencia detectada! Ambos libres ${dayId} en la ${blockId === 'morning' ? 'mañana' : blockId === 'afternoon' ? 'tarde' : 'noche'} 🤝`);
      }

      return {
        ...prev,
        availability: {
          ...prev.availability,
          [activePartner]: {
            ...prev.availability[activePartner],
            [dayId]: updatedList
          }
        }
      };
    });
  };

  // Quick 1-tap agreement for synchronous session
  const handleQuickAgreeSync = (dayId, blockId) => {
    const dayObj = DAYS_OF_WEEK.find(d => d.id === dayId);
    const blockObj = TIME_BLOCKS.find(b => b.id === blockId);
    const dayLabel = dayObj ? dayObj.label : dayId;
    const blockLabel = blockObj ? blockObj.label : blockId;
    
    // Check if session already exists
    const existing = (data.schedule || []).find(s => s.day === dayId && s.block === blockId);
    if (existing) {
      setData(prev => ({
        ...prev,
        schedule: (prev.schedule || []).filter(s => s.id !== existing.id)
      }));
      triggerCelebration(`Sesión de ${dayLabel} desprogramada`);
      return;
    }

    const newSession = {
      id: `sch-${Date.now()}`,
      day: dayId,
      block: blockId,
      mode: 'conjunta',
      partnerId: 'both',
      projectId: 'p1',
      projectName: 'Proyecto 1',
      title: `Sesión en Dupla (${dayLabel})`,
      hoursEst: blockObj ? blockObj.defaultHours : 3.0,
      timeRange: blockObj ? blockObj.range : 'Horario acordado'
    };

    // Ensure both partners are marked as available for this slot
    setData(prev => {
      const currentR = prev.availability?.rodrigo?.[dayId] || [];
      const currentF = prev.availability?.francisco?.[dayId] || [];
      const updatedR = currentR.includes(blockId) ? currentR : [...currentR, blockId];
      const updatedF = currentF.includes(blockId) ? currentF : [...currentF, blockId];
      
      return {
        ...prev,
        availability: {
          ...prev.availability,
          rodrigo: { ...prev.availability?.rodrigo, [dayId]: updatedR },
          francisco: { ...prev.availability?.francisco, [dayId]: updatedF }
        },
        schedule: [newSession, ...(prev.schedule || [])]
      };
    });

    triggerCelebration(`¡Sesión en Dupla acordada para ${dayLabel} (${blockLabel})! 🤝✨`);
  };

  // Open booking modal
  const handleOpenBooking = (dayId, blockId, preferredMode = null) => {
    setBookingDay(dayId);
    setBookingBlock(blockId);
    const rAvail = data.availability?.rodrigo?.[dayId]?.includes(blockId);
    const fAvail = data.availability?.francisco?.[dayId]?.includes(blockId);
    const bothAvail = rAvail && fAvail;

    if (preferredMode) {
      setBookingMode(preferredMode);
      setBookingPartner(preferredMode === 'conjunta' ? 'both' : activePartner);
    } else if (bothAvail) {
      setBookingMode('conjunta');
      setBookingPartner('both');
    } else {
      setBookingMode('individual');
      setBookingPartner(activePartner);
    }

    const blockConfig = TIME_BLOCKS.find(b => b.id === blockId);
    setBookingHours(blockConfig ? blockConfig.defaultHours : 3.0);
    setBookingProject('p1');
    setBookingTitle('');
    setIsBookingModalOpen(true);
  };

  // Save or replace scheduled session
  const handleSaveSchedule = (e) => {
    e.preventDefault();
    const blockConfig = TIME_BLOCKS.find(b => b.id === bookingBlock);
    const projInfo = data.projects.find(p => p.id === bookingProject) || data.projects[0];
    
    const newSession = {
      id: `sch-${Date.now()}`,
      day: bookingDay,
      block: bookingBlock,
      mode: bookingMode,
      partnerId: bookingMode === 'conjunta' ? 'both' : bookingPartner,
      projectId: bookingProject,
      projectName: projInfo.name,
      title: bookingTitle.trim() || (bookingMode === 'conjunta' ? 'Sesión en Dupla Sincrónica' : `Trabajo individual de ${bookingPartner === 'rodrigo' ? 'Rodrigo' : 'Francisco'}`),
      hoursEst: Number(bookingHours) || 3.0,
      timeRange: blockConfig ? blockConfig.range : 'Horario acordado'
    };

    setData(prev => {
      const filtered = (prev.schedule || []).filter(s => !(s.day === bookingDay && s.block === bookingBlock));
      return {
        ...prev,
        schedule: [newSession, ...filtered]
      };
    });

    setIsBookingModalOpen(false);
    if (bookingMode === 'conjunta') {
      triggerCelebration(`¡Sesión en Dupla agendada con éxito! 🤝✨`);
    } else {
      triggerCelebration(`Jornada individual programada 🚀`);
    }
  };

  // Delete scheduled session
  const handleDeleteSchedule = (sessionId) => {
    setData(prev => ({
      ...prev,
      schedule: (prev.schedule || []).filter(s => s.id !== sessionId)
    }));
    triggerCelebration('Jornada desprogramada');
  };

  // Menu items list (Módulos del Sistema)
  const MENU_ITEMS = [
    { id: 'jornadas', label: 'Jornadas', icon: Clock, color: 'text-teal-400', bg: 'bg-teal-500/15', desc: 'Registrar tiempo y avances realizados' },
    { id: 'coordinacion', label: 'Disponibilidad Semanal', icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-500/15', desc: 'Coordinar horarios y coincidencias en dupla' },
    { id: 'finanzas', label: 'Caja & Reparto', icon: Coins, color: 'text-indigo-400', bg: 'bg-indigo-500/15', desc: 'Patrimonio y liquidaciones' },
    { id: 'metricas', label: 'Métricas & Rendimiento', icon: Trophy, color: 'text-cyan-400', bg: 'bg-cyan-500/15', desc: 'Resumen de operación, metas y balance' },
  ];

  const handleNavigate = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <DeviceEmulator
      isOpen={isEmulatorOpen}
      onToggle={() => setIsEmulatorOpen(!isEmulatorOpen)}
      currentDevice={emulatorDevice}
      onChangeDevice={setEmulatorDevice}
      isLandscape={emulatorLandscape}
      onToggleOrientation={() => setEmulatorLandscape(!emulatorLandscape)}
      scale={emulatorScale}
      onChangeScale={setEmulatorScale}
    >
      <div className="min-h-screen bg-[#080c16] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-emerald-500 selection:text-white">
        
        {/* ================= 1. HEADER LIMPIO Y UNIFICADO CON LOGO OFICIAL GEOCONECTA ================= */}
        <header className="sticky top-0 z-40 bg-[#0c1220]/95 backdrop-blur-xl border-b border-slate-800/80 px-4 py-2.5">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
            
            {/* LADO IZQUIERDO: Logo oficial GeoConecta siempre visible como acceso directo al Inicio */}
            <button 
              onClick={() => setActiveTab('inicio')}
              className="flex items-center gap-2.5 text-left group transition-all active:scale-95 focus:outline-none"
              title="Ir a la pantalla de Inicio"
            >
              <div className="w-8 h-8 rounded-xl bg-white p-1 flex items-center justify-center shadow-md shadow-emerald-500/15 shrink-0 overflow-hidden group-hover:ring-2 group-hover:ring-[#00b493] transition-all">
                <img src="/logo_geoconecta.png" alt="GeoConecta" className="w-full h-full object-contain" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                    Geo<span className="text-[#00b493]">Conecta</span>
                  </span>
                  {activeTab !== 'inicio' && (
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-[#00b493] text-[9px] font-black border border-emerald-500/30">
                      ← Inicio
                    </span>
                  )}
                </div>
              </div>
            </button>

            {/* LADO DERECHO: Selector de Socios sutil y discreto */}
            <div className="flex items-center bg-[#060912] p-0.5 rounded-xl border border-slate-800/90 text-xs shrink-0">
              <button
                onClick={() => setActivePartner('rodrigo')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
                  activePartner === 'rodrigo'
                    ? 'bg-slate-800 text-emerald-400 shadow-sm font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Cambiar a Rodrigo"
              >
                <span>👨‍💻</span>
                <span>Rodrigo</span>
              </button>

              <button
                onClick={() => setActivePartner('francisco')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
                  activePartner === 'francisco'
                    ? 'bg-slate-800 text-indigo-400 shadow-sm font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Cambiar a Francisco"
              >
                <span>⚡</span>
                <span>Francisco</span>
              </button>
            </div>

          </div>
        </header>

        {/* ================= TOAST CELEBRACIÓN ================= */}
        {celebrationToast && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm animate-bounce">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-black shadow-2xl flex items-center gap-2 border border-emerald-300">
              <Sparkles className="w-4 h-4 text-slate-950 shrink-0" />
              <span className="flex-1">{celebrationToast}</span>
            </div>
          </div>
        )}

        {/* ================= 3. ÁREA PRINCIPAL ================= */}
        <main className="flex-1 max-w-xl w-full mx-auto px-4 py-5 space-y-4">
          
          {/* ================= PANTALLA DE INICIO (BOTONES PRINCIPALES PROTAGONISTAS) ================= */}
          {activeTab === 'inicio' && (
            <div className="space-y-4 animate-fade-in">

              {/* Saludo sutil y resumen rápido */}
              <div className="px-1 flex items-center justify-between">
                <div>
                  <h1 className="text-base sm:text-lg font-black text-white">
                    Hola, {currentPartnerName} 👋
                  </h1>
                  <p className="text-xs text-slate-400">
                    Panel de coordinación y gestión entre socios
                  </p>
                </div>

                <span className="text-[11px] font-semibold text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800">
                  {formatHours(partnerCurrentHours)} registradas
                </span>
              </div>

              {/* PUENTE COMPACTO DE COMUNICACIÓN CON TU SOCIO (SOLO ICONOS - AHORRA ESPACIO) */}
              <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-2 sm:px-3 sm:py-2 flex items-center justify-between gap-2 shadow-md">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="text-xs font-bold text-white truncate">
                    Socio: <span className="text-[#00b493] font-black">{otherContact.name}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 hidden sm:inline">
                    ({otherContact.city})
                  </span>
                </div>

                {/* Solo Iconos de Acción Directa */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={otherContact.meetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 hover:border-emerald-400 text-emerald-400 hover:text-white hover:bg-emerald-500 flex items-center justify-center transition-all active:scale-90"
                    title="Google Meet: Videollamada"
                  >
                    <Video className="w-4 h-4" />
                  </a>

                  <a
                    href={`https://wa.me/${otherContact.whatsapp}?text=${encodeURIComponent(`Hola ${otherContact.name}, ¿coordinamos avances de GeoConecta?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-xl bg-green-500/15 border border-green-500/30 hover:border-green-400 text-green-400 hover:text-white hover:bg-green-500 flex items-center justify-center transition-all active:scale-90"
                    title={`WhatsApp: Chat directo con ${otherContact.name}`}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>

                  <a
                    href={`tel:${otherContact.phone}`}
                    className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 hover:border-amber-400 text-amber-400 hover:text-white hover:bg-amber-500 flex items-center justify-center transition-all active:scale-90"
                    title={`Llamada directa a ${otherContact.name}`}
                  >
                    <Phone className="w-4 h-4" />
                  </a>

                  <a
                    href={otherContact.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 hover:border-indigo-400 text-indigo-400 hover:text-white hover:bg-indigo-500 flex items-center justify-center transition-all active:scale-90"
                    title="Google Drive: Propuestas y mapas en la nube"
                  >
                    <FolderOpen className="w-4 h-4" />
                  </a>

                  <button
                    onClick={handleOpenEditContact}
                    className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-200 flex items-center justify-center transition-all active:scale-90 ml-0.5"
                    title="Configurar números y enlaces"
                  >
                    <span className="text-xs">⚙️</span>
                  </button>
                </div>
              </div>

              {/* LOS 4 BOTONES PRINCIPALES (PROTAGONISMO ABSOLUTO) */}
              <div className="space-y-2.5 pt-1">
                {MENU_ITEMS.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className="w-full p-4 sm:p-4.5 rounded-2xl flex items-center gap-3.5 transition-all text-left group active:scale-[0.98] bg-[#0c1220] hover:bg-[#11192e] text-slate-200 border border-slate-800 hover:border-slate-700 shadow-lg shadow-black/20"
                    >
                      <div className={`p-3 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform shrink-0 shadow-sm`}>
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-sm sm:text-base font-black text-white block group-hover:text-emerald-400 transition-colors">
                          {item.label}
                        </span>
                        <span className="text-xs text-slate-400 block font-normal truncate mt-0.5">
                          {item.desc}
                        </span>
                      </div>

                      <div className="w-8 h-8 rounded-xl bg-slate-900/60 flex items-center justify-center text-slate-500 group-hover:text-emerald-400 group-hover:bg-slate-800 transition-all shrink-0">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Pie de sesión discreto (información secundaria de referencia) */}
              <div className="pt-2 text-center">
                <span className="text-[11px] text-slate-500">
                  Tarifa acordada: <b className="text-slate-400">{formatCurrency(hourlyRate)}/hr</b> • Tarifa igualitaria para ambos socios
                </span>
              </div>

            </div>
          )}

          {/* ================= PESTAÑA: JORNADAS ================= */}
          {activeTab === 'jornadas' && (
            <div className="space-y-4 animate-fade-in">
              
              {/* Botón: Modo Enfoque Timer */}
              <div className="bg-[#0e1526] border border-slate-800 rounded-3xl p-3.5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${isTimerRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isTimerRunning ? `Enfoque: ${formatTimer(timerSeconds)}` : '¿Trabajando ahora en paralelo?'}
                    </span>
                    <span className="text-[10px] text-slate-400">Inicia el cronómetro de foco en vivo</span>
                  </div>
                </div>

                {!isTimerRunning ? (
                  <button
                    onClick={() => setIsTimerRunning(true)}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 flex items-center gap-1 text-xs font-bold transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Iniciar</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      const hrs = Math.max(0.25, parseFloat((timerSeconds / 3600).toFixed(2)));
                      setLogHours(hrs);
                      setTimerSeconds(0);
                    }}
                    className="p-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white flex items-center gap-1 text-xs font-bold shadow-md shadow-red-600/30 transition-all"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Cargar {formatTimer(timerSeconds)}</span>
                  </button>
                )}
              </div>

              {/* Formulario Visual Táctil */}
              <div className="bg-[#0e1526] border border-emerald-500/30 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-white">Suma tu Tiempo</h2>
                      <p className="text-[10px] text-slate-400">Registra un bloque de trabajo</p>
                    </div>
                  </div>

                  <div className="flex bg-[#060912] p-1 rounded-xl border border-slate-800 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setLogMode('individual')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        logMode === 'individual' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      👤 Solo
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogMode('conjunta')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        logMode === 'conjunta' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      👥 Juntos
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSaveLog} className="space-y-3.5">
                  
                  {/* Selector Visual de Horas */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {PRESET_HOURS.map(item => {
                      const Icon = item.icon;
                      const isSelected = logHours === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setLogHours(item.value)}
                          className={`py-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all active:scale-95 ${
                            isSelected
                              ? 'bg-gradient-to-b from-emerald-500 to-teal-600 text-white border-emerald-400 shadow-md shadow-emerald-500/30 scale-105'
                              : 'bg-[#060912] text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-emerald-400'}`} />
                          <span className="text-xs font-black">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selector de Proyecto: 4 Botones Iconográficos */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {Object.keys(PROJECT_ICONS).map(key => {
                      const info = PROJECT_ICONS[key];
                      const isSelected = logProject === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setLogProject(key)}
                          className={`p-2 rounded-2xl border flex flex-col items-center justify-center gap-1 text-center transition-all ${
                            isSelected
                              ? `${info.activeBg} border-transparent shadow-md scale-105`
                              : `${info.bg} ${info.border} ${info.text} hover:opacity-90`
                          }`}
                        >
                          <span className="text-base">{info.emoji}</span>
                          <span className="text-[10px] font-black">{info.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Resumen */}
                  <input
                    type="text"
                    placeholder={`¿Qué resolviste hoy, ${currentPartnerName}?`}
                    value={logSummary}
                    onChange={(e) => setLogSummary(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#060912] border border-slate-800 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    required
                  />

                  {/* Botón Principal */}
                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Guardar Jornada (+{formatCurrency(logHours * hourlyRate * (logMode === 'conjunta' ? 2 : 1))})</span>
                  </button>

                </form>

              </div>

              {/* Feed Visual */}
              <div className="space-y-2">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider px-1 block">
                  Bitácora de Horas
                </span>

                <div className="space-y-2">
                  {data.logs.map(log => {
                    const isJoint = log.mode === 'conjunta' || log.partnerId === 'both';
                    const iconInfo = PROJECT_ICONS[log.projectId] || PROJECT_ICONS.p1;
                    return (
                      <div
                        key={log.id}
                        className="p-3 rounded-2xl bg-[#0e1526] border border-slate-800 text-xs flex items-center justify-between gap-3 shadow-sm"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <span className="text-lg shrink-0">{iconInfo.emoji}</span>
                          <div className="min-w-0 flex-1">
                            <span className="font-extrabold text-white truncate block">{log.description}</span>
                            <span className="text-[10px] text-slate-400 block">
                              {isJoint ? '👥 Juntos' : log.partnerName} • {formatDate(log.date)}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-black text-white text-xs block">+{formatHours(log.hours)}</span>
                          <span className="text-[10px] text-emerald-400 font-bold">
                            +{formatCurrency(log.hours * hourlyRate * (isJoint ? 2 : 1))}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ================= PESTAÑA: COORDINACIÓN DE DISPONIBILIDAD ================= */}
          {activeTab === 'coordinacion' && (
            <div className="space-y-4 animate-fade-in text-xs">
              
              {/* ENCABEZADO CON SELECTOR DE SOCIO Y RESUMEN DE COINCIDENCIAS */}
              <div className="bg-gradient-to-br from-[#0c1220] via-[#0e1628] to-[#070b14] border border-amber-500/30 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-white">
                        Coordinación de Disponibilidad
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Marca tus franjas libres para detectar cuándo ambos coinciden
                      </p>
                    </div>
                  </div>
                </div>

                {/* SELECTOR RÁPIDO DE SOCIO ACTIVO PARA MARCAR HORARIOS */}
                <div className="p-2.5 rounded-2xl bg-[#060912] border border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-400">
                    Marcando disponibilidad como:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActivePartner('rodrigo')}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1 ${
                        activePartner === 'rodrigo'
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>👨‍💻</span>
                      <span>Rodrigo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePartner('francisco')}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1 ${
                        activePartner === 'francisco'
                          ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>⚡</span>
                      <span>Francisco</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* LA CUADRÍCULA DE DISPONIBILIDAD (COMPACTA: SOLO COLORES E ICONOS) */}
              <div className="bg-[#0c1220] border border-slate-800 rounded-3xl p-3 sm:p-4 space-y-2 shadow-xl">
                <div className="flex items-center justify-between px-2 pb-1 border-b border-slate-800/80">
                  <span className="text-xs font-black text-white">Semáforo Semanal</span>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-[180px] sm:w-[210px] text-center text-[11px] font-bold text-slate-400">
                    <span className="flex items-center justify-center gap-1" title="Mañana (09:00 - 13:00)">🌅 <span className="hidden sm:inline text-[10px]">Mañ</span></span>
                    <span className="flex items-center justify-center gap-1" title="Tarde (14:00 - 18:00)">☀️ <span className="hidden sm:inline text-[10px]">Tar</span></span>
                    <span className="flex items-center justify-center gap-1" title="Noche (19:30 - 22:30)">🌙 <span className="hidden sm:inline text-[10px]">Noc</span></span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {DAYS_OF_WEEK.map(d => (
                    <div
                      key={d.id}
                      className="px-2.5 py-1.5 rounded-2xl bg-[#060912] border border-slate-800/70 flex items-center justify-between gap-2 hover:border-slate-700 transition-colors"
                    >
                      {/* Nombre del Día */}
                      <span className="text-xs font-bold text-slate-200 capitalize w-16 sm:w-20 shrink-0">
                        {d.label}
                      </span>

                      {/* Las 3 Celdas Iconográficas Táctiles */}
                      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-[180px] sm:w-[210px] shrink-0">
                        {TIME_BLOCKS.map(b => {
                          const rAvail = data.availability?.rodrigo?.[d.id]?.includes(b.id);
                          const fAvail = data.availability?.francisco?.[d.id]?.includes(b.id);
                          const bothAvail = rAvail && fAvail;
                          const isMyAvail = activePartner === 'rodrigo' ? rAvail : fAvail;
                          const otherAvail = activePartner === 'rodrigo' ? fAvail : rAvail;
                          const session = (data.schedule || []).find(s => s.day === d.id && s.block === b.id);
                          const isSyncSession = session?.mode === 'conjunta';

                          return (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => handleToggleMyAvailability(d.id, b.id)}
                              className={`h-9 rounded-xl border flex items-center justify-center text-sm font-bold transition-all active:scale-90 ${
                                isSyncSession
                                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                                  : bothAvail
                                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse shadow-md shadow-amber-500/20 ring-1 ring-amber-400/40'
                                  : isMyAvail
                                  ? 'bg-teal-500/20 border-teal-500/60 text-teal-300'
                                  : otherAvail
                                  ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300'
                                  : 'bg-[#080d19] border-slate-800/80 text-slate-700 hover:border-slate-700'
                              }`}
                              title={`${d.label} ${b.label}: ${
                                isSyncSession 
                                  ? 'Dupla acordada 🤝' 
                                  : bothAvail 
                                  ? '¡Ambos libres! ✨' 
                                  : isMyAvail 
                                  ? 'Tú disponible ✓' 
                                  : otherAvail 
                                  ? 'Socio disponible' 
                                  : 'No disponible'
                              }`}
                            >
                              {isSyncSession ? (
                                <span>🤝</span>
                              ) : bothAvail ? (
                                <span className="text-base">✨</span>
                              ) : isMyAvail ? (
                                <span className="text-teal-400 text-xs font-black">✓</span>
                              ) : otherAvail ? (
                                <span className="text-indigo-400 text-xs font-black">{activePartner === 'rodrigo' ? '⚡' : '👨‍💻'}</span>
                              ) : (
                                <span className="text-slate-700 text-xs">•</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Leyenda Visual de Iconos y Colores */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-md bg-amber-500/30 border border-amber-400 text-[8px] flex items-center justify-center text-amber-300">✨</span>
                      <span>Ambos</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-md bg-emerald-500 text-[8px] flex items-center justify-center text-slate-950">🤝</span>
                      <span>Dupla</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-md bg-teal-500/20 border border-teal-500 text-[8px] flex items-center justify-center text-teal-300">✓</span>
                      <span>Tú</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-md bg-indigo-950 border border-indigo-500 text-[8px] flex items-center justify-center text-indigo-300">{activePartner === 'rodrigo' ? '⚡' : '👨‍💻'}</span>
                      <span>Socio</span>
                    </span>
                  </div>
                  <span className="text-slate-500 text-[9px]">1 tap cambia tu estado</span>
                </div>
              </div>

              {/* SESIONES ACORDADAS (SI EXISTEN COINCIDENCIAS ACORDADAS) */}
              {(data.schedule || []).filter(s => s.mode === 'conjunta').length > 0 && (
                <div className="bg-[#0c1220] border border-emerald-500/30 rounded-3xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>🤝 Encuentros Sincrónicos Acordados</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      {(data.schedule || []).filter(s => s.mode === 'conjunta').length} sesión(es)
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(data.schedule || []).filter(s => s.mode === 'conjunta').map(session => {
                      const dayObj = DAYS_OF_WEEK.find(d => d.id === session.day);
                      const blockObj = TIME_BLOCKS.find(b => b.id === session.block);

                      return (
                        <div
                          key={session.id}
                          className="p-3 rounded-2xl bg-[#060912] border border-slate-800 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-base">{blockObj?.emoji || '🤝'}</span>
                            <div className="min-w-0">
                              <span className="font-black text-white text-xs block capitalize">
                                {dayObj?.label || session.day} • {blockObj?.label || session.block}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {session.timeRange || blockObj?.range} • Ambos confirmados
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <a
                              href={otherContact.meetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] flex items-center gap-1 shadow-sm active:scale-95"
                              title="Entrar a Google Meet"
                            >
                              <Video className="w-3 h-3" />
                              <span>Meet</span>
                            </a>
                            <button
                              onClick={() => handleDeleteSchedule(session.id)}
                              className="px-2 py-1.5 rounded-xl bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 text-[10px] font-bold"
                              title="Cancelar encuentro"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ================= PESTAÑA: FINANZAS (CAJA & REPARTO) ================= */}
          {activeTab === 'finanzas' && (
            <div className="space-y-4 animate-fade-in">

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#0e1526] border border-emerald-500/30 text-center space-y-1">
                  <span className="text-base block">👨‍💻 Rodrigo</span>
                  <span className="text-lg font-black text-emerald-400 block">{formatCurrency(rHours * hourlyRate)}</span>
                  <span className="text-[10px] text-slate-400 font-bold">{formatHours(rHours)} ({formatPercent(rShare)})</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0e1526] border border-indigo-500/30 text-center space-y-1">
                  <span className="text-base block">⚡ Francisco</span>
                  <span className="text-lg font-black text-indigo-400 block">{formatCurrency(fHours * hourlyRate)}</span>
                  <span className="text-[10px] text-slate-400 font-bold">{formatHours(fHours)} ({formatPercent(fShare)})</span>
                </div>
              </div>

              {/* Simulador de Reparto */}
              <div className="bg-[#0e1526] border border-slate-800 rounded-3xl p-4 space-y-3 text-xs">
                <span className="font-black text-white block">Simulador de Reparto de Facturas</span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Cobro Cliente:</span>
                    <input
                      type="number"
                      step="100000"
                      value={invoiceAmount}
                      onChange={(e) => setInvoiceAmount(Number(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-[#060912] border border-slate-700 rounded-xl text-white font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Gastos Directos:</span>
                    <input
                      type="number"
                      step="50000"
                      value={directCosts}
                      onChange={(e) => setDirectCosts(Number(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-[#060912] border border-slate-700 rounded-xl text-white font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-3 rounded-2xl bg-[#060912] border border-emerald-500/40 text-center">
                    <span className="text-[10px] text-slate-400 block font-bold">Rodrigo ({formatPercent(rShare)})</span>
                    <span className="text-base font-black text-emerald-400 block">{formatCurrency(rPayout)}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#060912] border border-indigo-500/40 text-center">
                    <span className="text-[10px] text-slate-400 block font-bold">Francisco ({formatPercent(fShare)})</span>
                    <span className="text-base font-black text-indigo-400 block">{formatCurrency(fPayout)}</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-[#060912] text-slate-400 text-[10px] flex justify-between">
                  <span>Reserva GeoConecta (20%):</span>
                  <span className="font-bold text-amber-400">{formatCurrency(reserveFund)}</span>
                </div>
              </div>

            </div>
          )}

          {/* ================= PESTAÑA: MÉTRICAS & RENDIMIENTO ================= */}
          {activeTab === 'metricas' && (
            <div className="space-y-4 animate-fade-in text-xs">

              {/* TARJETA DE ESTADO & BALANCE DE LA SOCIEDAD (MOVIDA DESDE INICIO) */}
              <div className="bg-gradient-to-br from-[#0e1526] via-[#11192e] to-[#0a1220] border border-emerald-500/30 rounded-3xl p-5 shadow-xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📊</span>
                    <div>
                      <h4 className="text-sm font-black text-white">Resumen de Operación</h4>
                      <p className="text-[10px] text-slate-400">Métricas clave consolidadas</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] border border-emerald-500/30">
                    Tarifa: {formatCurrency(hourlyRate)}/hr
                  </span>
                </div>

                {/* 4 Widgets Iconográficos Rápidos */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  
                  <div className="bg-[#060912] border border-amber-500/30 rounded-2xl p-2.5 text-center">
                    <Flame className="w-4 h-4 text-amber-400 fill-amber-400 mx-auto mb-0.5" />
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Racha</span>
                    <span className="text-xs font-black text-amber-300">4d</span>
                  </div>

                  <div className="bg-[#060912] border border-emerald-500/30 rounded-2xl p-2.5 text-center">
                    <Target className="w-4 h-4 text-emerald-400 mx-auto mb-0.5" />
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Meta</span>
                    <span className="text-xs font-black text-emerald-400">{Math.round(goalProgress * 100)}%</span>
                  </div>

                  <div className="bg-[#060912] border border-teal-500/30 rounded-2xl p-2.5 text-center">
                    <Clock className="w-4 h-4 text-teal-400 mx-auto mb-0.5" />
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Horas</span>
                    <span className="text-xs font-black text-white">{formatHours(totalEffectiveHours)}</span>
                  </div>

                  <div className="bg-[#060912] border border-indigo-500/30 rounded-2xl p-2.5 text-center">
                    <Coins className="w-4 h-4 text-indigo-400 mx-auto mb-0.5" />
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Caja</span>
                    <span className="text-xs font-black text-indigo-400">{formatCurrency(totalEffectiveHours * hourlyRate)}</span>
                  </div>

                </div>

                {/* Barra de Equilibrio */}
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span>Rodrigo: <b>{formatPercent(rShare)}</b> ({formatHours(rHours)})</span>
                    <span>Francisco: <b>{formatPercent(fShare)}</b> ({formatHours(fHours)})</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-950 overflow-hidden flex p-0.5 border border-slate-800">
                    <div style={{ width: `${rShare * 100}%` }} className="bg-emerald-500 h-full rounded-full transition-all" />
                    <div style={{ width: `${fShare * 100}%` }} className="bg-indigo-500 h-full rounded-full transition-all" />
                  </div>
                </div>
              </div>

              {/* Logros e Hitos */}
              <div className="bg-[#0e1526] border border-slate-800 rounded-3xl p-5 text-center space-y-3 shadow-sm">
                <span className="text-3xl block">🏆</span>
                <span className="text-sm font-black text-white block">Logros & Hitos de la Sociedad</span>
                
                <div className="grid grid-cols-2 gap-2 text-left pt-2">
                  <div className="p-2.5 rounded-2xl bg-[#060912] border border-slate-800 flex items-center gap-2">
                    <span className="text-lg">🌱</span>
                    <div>
                      <span className="font-bold text-white block text-[11px]">Inicio Firme</span>
                      <span className="text-[10px] text-slate-400">Primeras 15h registradas</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-[#060912] border border-slate-800 flex items-center gap-2">
                    <span className="text-lg">⚖️</span>
                    <div>
                      <span className="font-bold text-white block text-[11px]">Equilibrio</span>
                      <span className="text-[10px] text-slate-400">Cerca de paridad 50/50</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => triggerCelebration('¡Viva GeoConecta! 🎉')}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all mt-2 active:scale-95"
                >
                  🎉 Celebrar Avances de Socios
                </button>
              </div>
            </div>
          )}

        </main>

        {/* ================= 4. PIE DE PÁGINA DISCRETO CON ESTADO SUPABASE ================= */}
        <footer className="border-t border-slate-800/80 py-3 px-4 text-[10px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-xl mx-auto w-full">
          <span>GeoConecta © 2026 • Modo Socios</span>

          <button
            onClick={() => setIsSupabaseModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0c1220] border border-slate-800 hover:border-slate-700 transition-colors text-[10px] font-bold active:scale-95"
            title="Gestionar conexión en la nube con Supabase"
          >
            {supabaseConfig.isConnected ? (
              <>
                <span className={`w-2 h-2 rounded-full ${isCloudSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                <span className="text-emerald-400">
                  {isCloudSyncing ? 'Sincronizando nube...' : '☁️ Supabase Conectado'}
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                <span className="text-slate-400 hover:text-white">💾 Modo Local (Conectar Supabase)</span>
              </>
            )}
          </button>
        </footer>

                {/* ================= MODAL: CONFIGURAR CANALES DE SOCIO ================= */}
        {isContactModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-sm bg-[#0c1220] border border-emerald-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div>
                  <h3 className="text-sm font-black text-white">Canales de Contacto Directo</h3>
                  <p className="text-[10px] text-emerald-400 font-bold">
                    Socio remoto: {otherContact.name} ({otherContact.city})
                  </p>
                </div>
                <button
                  onClick={() => setIsContactModalOpen(false)}
                  className="p-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveContact} className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Número WhatsApp (con código de país, ej: 56912345678)
                  </label>
                  <input
                    type="text"
                    value={editWhatsapp}
                    onChange={(e) => setEditWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 bg-[#060912] border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    placeholder="56912345678"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Teléfono directo para llamadas
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#060912] border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    placeholder="+56912345678"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Enlace Google Meet permanente
                  </label>
                  <input
                    type="url"
                    value={editMeetUrl}
                    onChange={(e) => setEditMeetUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-[#060912] border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Enlace Google Drive compartido (Propuestas / Modelos)
                  </label>
                  <input
                    type="url"
                    value={editDriveUrl}
                    onChange={(e) => setEditDriveUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-[#060912] border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    placeholder="https://drive.google.com/drive/folders/..."
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsContactModalOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-900 text-slate-400 font-bold border border-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md shadow-emerald-500/20 active:scale-95"
                  >
                    Guardar Canales
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: CONEXIÓN CLOUD SUPABASE ================= */}
        {isSupabaseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-[#0c1220] border border-emerald-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Nube Compartida (Supabase)</h3>
                    <p className="text-[10px] text-slate-400">Sincronización en tiempo real entre socios</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSupabaseModalOpen(false)}
                  className="p-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-[#060912] border border-slate-800/80 space-y-1.5 text-xs">
                <span className="font-bold text-white block text-[11px]">Estado actual:</span>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${supabaseConfig.isConnected ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  <span className={`font-bold ${supabaseConfig.isConnected ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {supabaseConfig.isConnected ? 'Conectado a la nube • Sincronización activa' : 'Modo local (solo este navegador)'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {supabaseConfig.isConnected
                    ? 'Los cambios de jornadas y disponibilidad se sincronizan automáticamente con tu socio.'
                    : 'Para que ambos vean los mismos datos en ciudades distintas, ingresa tus credenciales gratuitas de Supabase.'}
                </p>
              </div>

              <form onSubmit={handleSaveSupabaseCredentials} className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Project URL de Supabase
                  </label>
                  <input
                    type="url"
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    placeholder="https://xxxxxxxxxxxx.supabase.co"
                    className="w-full px-3 py-2 bg-[#060912] border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Anon Public Key (API Key)
                  </label>
                  <textarea
                    rows={2}
                    value={supabaseKeyInput}
                    onChange={(e) => setSupabaseKeyInput(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3 py-2 bg-[#060912] border border-slate-800 rounded-xl text-white font-mono text-[10px] focus:outline-none focus:border-emerald-500 resize-none"
                    required
                  />
                </div>

                <div className="text-[10px] text-slate-500 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/60 space-y-1">
                  <span className="font-bold text-slate-400 block">¿Dónde encontrar estas llaves?</span>
                  <p>1. Entra a tu proyecto en <b>supabase.com</b></p>
                  <p>2. Ve a <b>Project Settings → API</b></p>
                  <p>3. En el SQL Editor ejecuta el script <b>supabase_schema.sql</b> incluido en el proyecto.</p>
                </div>

                <div className="flex gap-2 pt-1">
                  {supabaseConfig.isConnected && (
                    <button
                      type="button"
                      onClick={handleDisconnectSupabase}
                      className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 font-bold border border-slate-800 transition-colors text-xs"
                    >
                      Desconectar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsSupabaseModalOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-900 text-slate-400 font-bold border border-slate-800 text-xs"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 active:scale-95"
                  >
                    Guardar y Conectar
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </DeviceEmulator>
  );
}
