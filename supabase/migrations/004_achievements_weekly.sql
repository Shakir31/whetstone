-- Achievements, worn titles and weekly summaries.
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- Achievements a person has earned, kept permanently. Which achievements exist
-- and how they are earned is defined in src/lib/achievements.js. They are
-- cosmetic, so the app saves them itself.
create table public.achievements (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  key text not null,
  earned_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.achievements enable row level security;

create policy "Users can read their own achievements"
  on public.achievements for select
  using (auth.uid() = user_id);

create policy "Users can record their own achievements"
  on public.achievements for insert
  with check (auth.uid() = user_id);

-- Per-person settings. For now: the achievement title they have chosen to wear.
create table public.profiles (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  worn_title text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can create their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- The System's judgement of each calendar week (Monday to Sunday).
-- Written only by the weekly-judgement Edge Function.
create table public.weekly_summaries (
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start date not null, -- the Monday
  summary text not null,
  facts jsonb not null default '{}',
  created_at timestamptz not null default now(),
  primary key (user_id, week_start)
);

alter table public.weekly_summaries enable row level security;

create policy "Users can read their own weekly summaries"
  on public.weekly_summaries for select
  using (auth.uid() = user_id);
