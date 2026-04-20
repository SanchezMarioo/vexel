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