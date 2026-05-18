-- Run this in Supabase SQL Editor.
-- Server-side only model (NextAuth + service_role key).

create extension if not exists pgcrypto;

create table if not exists public.user_accounts (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text,
  avatar_url text,
  password_hash text,
  auth_source text not null default 'credentials',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint user_accounts_auth_source_check check (auth_source in ('credentials', 'google'))
);

create table if not exists public.user_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_accounts(id) on delete cascade,
  title text not null,
  summary text,
  status text not null default 'draft',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint user_projects_status_check check (status in ('draft', 'active', 'archived'))
);

create index if not exists idx_user_projects_user_id on public.user_projects(user_id);
create index if not exists idx_user_projects_updated_at on public.user_projects(updated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'set_user_accounts_updated_at'
      and tgrelid = 'public.user_accounts'::regclass
      and not tgisinternal
  ) then
    create trigger set_user_accounts_updated_at
    before update on public.user_accounts
    for each row
    execute procedure public.set_updated_at();
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'set_user_projects_updated_at'
      and tgrelid = 'public.user_projects'::regclass
      and not tgisinternal
  ) then
    create trigger set_user_projects_updated_at
    before update on public.user_projects
    for each row
    execute procedure public.set_updated_at();
  end if;
end
$$;

-- role column on user_accounts
alter table public.user_accounts
  add column if not exists role text not null default 'user'
  constraint user_accounts_role_check check (role in ('user', 'admin'));

-- request_id column on user_projects
alter table public.user_projects
  add column if not exists request_id uuid;

create table if not exists public.project_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_accounts(id) on delete cascade,
  title text not null,
  description text not null,
  project_type text not null default 'landing_page',
  budget text,
  reference_url text,
  status text not null default 'pending',
  admin_note text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint project_requests_type_check check (project_type in ('landing_page', 'local_campaign', 'ecommerce', 'other')),
  constraint project_requests_status_check check (status in ('pending', 'accepted', 'rejected'))
);

create index if not exists idx_project_requests_user_id on public.project_requests(user_id);
create index if not exists idx_project_requests_status on public.project_requests(status);

create table if not exists public.project_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.user_projects(id) on delete cascade,
  sender_id uuid not null references public.user_accounts(id) on delete cascade,
  sender_role text not null,
  content text not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint project_messages_sender_role_check check (sender_role in ('user', 'admin'))
);

create index if not exists idx_project_messages_project_id on public.project_messages(project_id, created_at);

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_project_requests_updated_at'
      and tgrelid = 'public.project_requests'::regclass
      and not tgisinternal
  ) then
    create trigger set_project_requests_updated_at
    before update on public.project_requests
    for each row
    execute procedure public.set_updated_at();
  end if;
end
$$;

-- FK from user_projects.request_id to project_requests.id (added after both tables exist)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'user_projects_request_id_fkey'
  ) then
    alter table public.user_projects
      add constraint user_projects_request_id_fkey
      foreign key (request_id) references public.project_requests(id) on delete set null;
  end if;
end
$$;

-- RLS
alter table public.user_accounts enable row level security;
alter table public.user_projects enable row level security;
alter table public.user_accounts force row level security;
alter table public.user_projects force row level security;

-- Optional hardening
revoke all on table public.user_accounts from anon, authenticated;
revoke all on table public.user_projects from anon, authenticated;
grant all on table public.user_accounts to service_role;
grant all on table public.user_projects to service_role;

-- Policies for service_role only (server-side access)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_accounts'
      and policyname = 'user_accounts_service_role_all'
  ) then
    create policy user_accounts_service_role_all
      on public.user_accounts
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_projects'
      and policyname = 'user_projects_service_role_all'
  ) then
    create policy user_projects_service_role_all
      on public.user_projects
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end
$$;

-- RLS for new tables
alter table public.project_requests enable row level security;
alter table public.project_messages enable row level security;
alter table public.project_requests force row level security;
alter table public.project_messages force row level security;

revoke all on table public.project_requests from anon, authenticated;
revoke all on table public.project_messages from anon, authenticated;
grant all on table public.project_requests to service_role;
grant all on table public.project_messages to service_role;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'project_requests'
      and policyname = 'project_requests_service_role_all'
  ) then
    create policy project_requests_service_role_all
      on public.project_requests
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'project_messages'
      and policyname = 'project_messages_service_role_all'
  ) then
    create policy project_messages_service_role_all
      on public.project_messages
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end
$$;

-- New columns on user_projects for admin project management
alter table public.user_projects
  add column if not exists budget_final numeric(10,2),
  add column if not exists estimated_days integer,
  add column if not exists admin_notes text;

-- Payment schedule table
create table if not exists public.project_payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.user_projects(id) on delete cascade,
  description text not null,
  amount numeric(10,2) not null,
  due_date date,
  status text not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint project_payments_status_check check (status in ('pending', 'paid'))
);

create index if not exists idx_project_payments_project_id on public.project_payments(project_id, created_at);

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_project_payments_updated_at'
      and tgrelid = 'public.project_payments'::regclass
      and not tgisinternal
  ) then
    create trigger set_project_payments_updated_at
    before update on public.project_payments
    for each row
    execute procedure public.set_updated_at();
  end if;
end
$$;

alter table public.project_payments enable row level security;
alter table public.project_payments force row level security;
revoke all on table public.project_payments from anon, authenticated;
grant all on table public.project_payments to service_role;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'project_payments'
      and policyname = 'project_payments_service_role_all'
  ) then
    create policy project_payments_service_role_all
      on public.project_payments
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end
$$;