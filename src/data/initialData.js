export const INITIAL_PARTNERS = [
  {
    id: 'rodrigo',
    name: 'Rodrigo',
    role: 'Socio Fundador',
    avatar: '👨‍💻',
    color: 'emerald',
    theme: {
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      bgLight: 'bg-emerald-500/10',
      border: 'border-emerald-500',
      text: 'text-emerald-400',
    }
  },
  {
    id: 'francisco',
    name: 'Francisco',
    role: 'Socio Fundador',
    avatar: '⚡',
    color: 'indigo',
    theme: {
      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      bgLight: 'bg-indigo-500/10',
      border: 'border-indigo-500',
      text: 'text-indigo-400',
    }
  }
];

export const INITIAL_PROJECTS = [
  {
    id: 'p1',
    name: 'Desarrollo de Software / Plataforma',
    category: 'Tecnología',
    color: '#10b981', // emerald
    description: 'Arquitectura, frontend, backend, visores y geoprocesamiento.',
    active: true
  },
  {
    id: 'p2',
    name: 'Comercial y Clientes',
    category: 'Negocios',
    color: '#6366f1', // indigo
    description: 'Reuniones de venta, propuestas comerciales y prospección.',
    active: true
  },
  {
    id: 'p3',
    name: 'Administración / Legal',
    category: 'Gestión',
    color: '#f59e0b', // amber
    description: 'Contratos, finanzas, constitución y facturación.',
    active: true
  },
  {
    id: 'p4',
    name: 'Operaciones en Terreno',
    category: 'Operaciones',
    color: '#06b6d4', // cyan
    description: 'Levantamiento de información, validación y visitas.',
    active: true
  }
];

export const INITIAL_SETTINGS = {
  hourlyRate: 30000, // $30.000 CLP estándar acordado
  currency: 'CLP',
  companyName: 'GeoConecta',
  reserveFundPercentage: 20, // 20% para fondo de reserva de GeoConecta
};

// ================= ESTADO LIMPIO PARA OPERACIÓN REAL =================
export const INITIAL_LOGS = [];

export const INITIAL_TASKS = [];

export const INITIAL_AVAILABILITY = {
  rodrigo: {
    lunes: [],
    martes: [],
    miercoles: [],
    jueves: [],
    viernes: [],
    sabado: [],
    domingo: [],
  },
  francisco: {
    lunes: [],
    martes: [],
    miercoles: [],
    jueves: [],
    viernes: [],
    sabado: [],
    domingo: [],
  }
};

export const INITIAL_SCHEDULE = [];
