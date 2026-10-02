-- Journal entries and the stat gains the System awarded for them.
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.

create table public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  text text not null check (char_length(text) between 1 and 5000),
  body numeric(2, 1) not null default 0 check (body between 0 and 1),
  mind numeric(2, 1) not null default 0 check (mind between 0 and 1),
  tags text[] not null default '{}',
  system_message text not null default '',
  created_at timestamptz not null default now()
);

create index entries_user_created_idx on public.entries (user_id, created_at desc);

-- Row Level Security: users can only read their own entries.
-- There is deliberately NO insert/update policy: entries are only created by the
-- score-entry Edge Function, so users can't award themselves stats directly.
alter table public.entries enable row level security;

create policy "Users can read their own entries"
  on public.entries for select
  using (auth.uid() = user_id);
