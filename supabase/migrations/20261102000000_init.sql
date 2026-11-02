-- Skinmatch schema. Row Level Security on every table: a user only sees and changes their own rows.
-- The server talks to Postgres directly and runs user queries as role "authenticated" with the user's id
-- in request.jwt.claims, so these policies apply to every user query.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  skin_type text check (skin_type in ('oily','dry','combination','normal','sensitive')),
  concerns text[] not null default '{}',
  answers jsonb not null default '{}'::jsonb,
  intended_plan text,
  source jsonb not null default '{}'::jsonb,
  plan_cache jsonb,
  period_start timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  device_id text,
  skin_type text,
  products jsonb not null default '[]'::jsonb,
  result jsonb not null,
  photo_thumb text,
  source text not null default 'try',
  created_at timestamptz not null default now()
);
create index if not exists checks_user_idx on public.checks(user_id, created_at desc);
create index if not exists checks_device_idx on public.checks(device_id) where user_id is null;

create table if not exists public.shelf_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  catalog_id text,
  brand text not null default '',
  name text not null,
  category text not null,
  actives text[] not null default '{}',
  when_used text not null default 'auto' check (when_used in ('auto','am','pm','both')),
  notes text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists shelf_user_idx on public.shelf_products(user_id, created_at);

create table if not exists public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  breakouts smallint not null check (breakouts between 1 and 5),
  dryness smallint not null check (dryness between 1 and 5),
  redness smallint not null check (redness between 1 and 5),
  oiliness smallint not null check (oiliness between 1 and 5),
  glow smallint not null check (glow between 1 and 5),
  note text not null default '',
  created_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

create table if not exists public.usage_events (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('check','scan','lookup')),
  created_at timestamptz not null default now()
);
create index if not exists usage_user_idx on public.usage_events(user_id, kind, created_at);

-- anonymous tries rate limit (server only, no user access at all)
create table if not exists public.anon_tries (
  id bigserial primary key,
  device_id text not null,
  ip_hash text not null,
  created_at timestamptz not null default now()
);
create index if not exists anon_tries_idx on public.anon_tries(created_at);

alter table public.profiles enable row level security;
alter table public.checks enable row level security;
alter table public.shelf_products enable row level security;
alter table public.diary_entries enable row level security;
alter table public.usage_events enable row level security;
alter table public.anon_tries enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "own checks" on public.checks;
create policy "own checks" on public.checks for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own shelf" on public.shelf_products;
create policy "own shelf" on public.shelf_products for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own diary" on public.diary_entries;
create policy "own diary" on public.diary_entries for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own usage read" on public.usage_events;
create policy "own usage read" on public.usage_events for select to authenticated
  using (user_id = auth.uid());
-- usage_events inserts and anon_tries are written by the server's privileged connection only.

grant select, insert, update, delete on public.profiles, public.checks, public.shelf_products, public.diary_entries to authenticated;
grant select on public.usage_events to authenticated;
revoke all on public.anon_tries from anon, authenticated;
revoke all on public.usage_events from anon;

-- a profile row for every new account
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
