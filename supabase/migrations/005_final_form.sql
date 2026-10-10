-- The class's final form: the second evolution, at class Rank V.
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.

alter table public.classes
  add column final_name text,
  add column final_description text,
  -- What was done since the first evolution: the class path deepened, the
  -- second path stayed bound to it, or the class turned toward a new path.
  add column final_outcome text check (final_outcome in ('deepened', 'bound', 'turned')),
  -- How steadily the path was kept in that time.
  add column final_temperament text check (final_temperament in ('steadfast', 'measured', 'restless', 'wavering')),
  -- For "turned": the new path that pulled at the class.
  add column final_path text check (final_path in ('strength', 'endurance', 'knowledge', 'craft', 'discipline')),
  add column final_at timestamptz;
