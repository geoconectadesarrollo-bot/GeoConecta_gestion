import { createClient } from '@supabase/supabase-js';

const SUPABASE_CONFIG_KEY = 'geoconecta_supabase_config';
const TABLE_NAME = 'geoconecta_state';
const STATE_ID = 'primary';

// Obtener configuración activa (desde localStorage o desde variables .env de Vite)
export const getSupabaseConfig = () => {
  let localConfig = null;
  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (raw) localConfig = JSON.parse(raw);
  } catch (e) {}

  const url = localConfig?.url || import.meta.env.VITE_SUPABASE_URL || '';
  const anonKey = localConfig?.anonKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  return {
    url: url.trim(),
    anonKey: anonKey.trim(),
    isConnected: Boolean(url && anonKey)
  };
};

// Guardar configuración manualmente desde la app
export const saveSupabaseConfig = (url, anonKey) => {
  const config = {
    url: (url || '').trim(),
    anonKey: (anonKey || '').trim(),
    isConnected: Boolean(url && anonKey)
  };
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
  return config;
};

// Limpiar configuración y volver a modo local
export const clearSupabaseConfig = () => {
  localStorage.removeItem(SUPABASE_CONFIG_KEY);
};

// Inicializar cliente de Supabase
let supabaseInstance = null;
let currentClientKey = '';

export const getSupabaseClient = () => {
  const { url, anonKey, isConnected } = getSupabaseConfig();
  if (!isConnected) return null;

  const keyCombo = `${url}::${anonKey}`;
  if (supabaseInstance && currentClientKey === keyCombo) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(url, anonKey, {
      auth: { persistSession: false },
      realtime: { params: { eventsPerSecond: 10 } }
    });
    currentClientKey = keyCombo;
    return supabaseInstance;
  } catch (err) {
    console.error('Error inicializando Supabase:', err);
    return null;
  }
};

// Descargar el estado completo desde la nube
export const fetchCloudState = async () => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('data, updated_at')
      .eq('id', STATE_ID)
      .maybeSingle();

    if (error) {
      console.warn('Aviso al consultar Supabase:', error.message);
      return null;
    }

    if (data && data.data) {
      return data.data;
    }
  } catch (err) {
    console.error('Error al descargar estado de Supabase:', err);
  }
  return null;
};

// Guardar el estado completo en la nube (Upsert)
export const pushCloudState = async (appState) => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert({
        id: STATE_ID,
        data: appState,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.error('Error al guardar estado en Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Excepción al enviar estado a Supabase:', err);
    return false;
  }
};

// Suscribirse a cambios en tiempo real entre los socios (Concepción ↔ Santiago)
export const subscribeToCloudState = (onRemoteChange) => {
  const supabase = getSupabaseClient();
  if (!supabase) return () => {};

  try {
    const channel = supabase
      .channel('geoconecta-realtime-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLE_NAME,
          filter: `id=eq.${STATE_ID}`
        },
        (payload) => {
          if (payload.new && payload.new.data) {
            onRemoteChange(payload.new.data);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('⚡ Sincronización Realtime activa con Supabase');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.error('Error al suscribir canal Realtime:', err);
    return () => {};
  }
};
