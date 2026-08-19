-- ==============================================================================
-- SCHEMA SUPABASE: TABLA DE LEADS PARA XYNC
-- ==============================================================================

-- 1. Habilitar extensión pgcrypto para generación de UUIDs
create extension if not exists "pgcrypto";

-- 2. Crear tabla public.leads
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  -- Estado de gestión del lead (6 estados aprobados)
  status text not null default 'nuevo' check (
    status in (
      'nuevo',
      'contactado',
      'llamada_agendada',
      'propuesta_enviada',
      'ganado',
      'perdido'
    )
  ),
  
  -- Datos de contacto
  nombre text not null,
  empresa text,
  email text not null,
  telefono text,
  descripcion text,
  
  -- Respuestas del proyecto (Funnel /empezar)
  situacion text not null,
  situacion_detalle text,
  tipo text not null,
  objetivo text,
  catalogo text,
  web_actual text,
  presupuesto text not null,
  plazo text not null,
  
  -- Atribución de marketing
  landing_page text,
  form_page text,
  current_url text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  
  -- Cualificación y Scoring
  score_value integer not null default 0,
  score_tier text not null default 'baja' check (score_tier in ('alta', 'media', 'baja')),
  score_reasons text[] default array[]::text[],
  
  -- Metadatos y notas internas
  is_update boolean not null default false,
  notes text default '',
  raw_answers jsonb
);

-- 3. Índices de rendimiento para el dashboard
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_score_value_idx on public.leads (score_value desc);
create index if not exists leads_email_idx on public.leads (email);

-- 4. Trigger para auto-actualizar updated_at
create or replace function public.handle_leads_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_leads_updated_at on public.leads;
create trigger trigger_leads_updated_at
before update on public.leads
for each row execute function public.handle_leads_updated_at();

-- 5. Row Level Security (RLS)
alter table public.leads enable row level security;

-- Por defecto, bloqueamos acceso directo público (anon no puede leer ni modificar directamente).
-- Las operaciones se gestionan a través del backend de Next.js con el SUPABASE_SERVICE_ROLE_KEY
-- que bypasses RLS de forma controlada y segura tras verificar la autenticación con Clerk.

-- Política opcional para service_role (permite todo al backend):
drop policy if exists "service_role_full_access" on public.leads;
create policy "service_role_full_access"
  on public.leads
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
