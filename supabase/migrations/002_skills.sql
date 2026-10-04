-- Skill names given by the System. A skill's rank is not stored: like the stats,
-- it is worked out from the entries' activity tags (see src/lib/skills.js).
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.

create table public.skills (
  user_id uuid not null references auth.users (id) on delete cascade,
  tag text not null,
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  primary key (user_id, tag)
);

-- Users can read their own skills. Only the score-entry Edge Function creates them.
alter table public.skills enable row level security;

create policy "Users can read their own skills"
  on public.skills for select
  using (auth.uid() = user_id);
