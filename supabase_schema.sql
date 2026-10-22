-- =========================================================================
-- ESQUEMA DE BASE DE DATOS PARA GEOCONECTA (CONSULTORA TERRITORIAL)
-- Ejecuta este script en el SQL Editor de tu proyecto en https://supabase.com
-- =========================================================================

-- 1. Crear tabla para el estado compartido en tiempo real
create table if not exists public.geoconecta_state (
  id text primary key default 'primary',
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilitar Row Level Security (RLS) con acceso público para los dos socios
alter table public.geoconecta_state enable row level security;

-- Política de lectura y escritura libre para los socios
drop policy if exists "Acceso total socios GeoConecta" on public.geoconecta_state;
create policy "Acceso total socios GeoConecta" 
  on public.geoconecta_state 
  for all 
  using (true) 
  with check (true);

-- 3. Habilitar la replicación en Tiempo Real (Realtime)
-- Permite que cuando Rodrigo en Concepción marque una jornada o disponibilidad,
-- a Francisco en Santiago se le actualice la pantalla al instante.
alter publication supabase_realtime add table public.geoconecta_state;

-- =========================================================================
-- ¡Listo! Tu base de datos está lista para sincronizar en tiempo real.
-- =========================================================================
