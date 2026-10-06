-- Classes. Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- The path each of a person's activities belongs to, decided once by the AI
-- the first time the activity appears.
create table public.activities (
  user_id uuid not null references auth.users (id) on delete cascade,
  tag text not null,
  path text not null check (path in ('strength', 'endurance', 'knowledge', 'craft', 'discipline')),
  created_at timestamptz not null default now(),
  primary key (user_id, tag)
);

-- A person's class: assigned at Will Lv. 5, evolved at class Rank III.
-- Rank is not stored: it is worked out from the entries (see src/lib/classes.js).
create table public.classes (
  user_id uuid primary key references auth.users (id) on delete cascade,
  base_class text not null check (base_class in ('ironclad', 'wayfarer', 'scholar', 'artisan', 'ascetic', 'hunter')),
  title text not null default '',
  assigned_at timestamptz not null default now(),
  evolved_name text,
  evolved_description text,
  evolved_path text check (evolved_path in ('strength', 'endurance', 'knowledge', 'craft', 'discipline')),
  evolved_at timestamptz
);

-- Users can read their own rows. Only the score-entry Edge Function writes them.
alter table public.activities enable row level security;
alter table public.classes enable row level security;

create policy "Users can read their own activities"
  on public.activities for select
  using (auth.uid() = user_id);

create policy "Users can read their own class"
  on public.classes for select
  using (auth.uid() = user_id);
