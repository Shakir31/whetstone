import { supabase } from './supabase.js'
import { classFromRow } from './classes.js'

// Database rows use snake_case; the app uses camelCase.
function fromRow(row) {
  return {
    id: row.id,
    text: row.text,
    body: Number(row.body),
    mind: Number(row.mind),
    tags: row.tags ?? [],
    systemMessage: row.system_message,
    createdAt: row.created_at,
  }
}

// { [tag]: { name, description } }
function namesFromRows(rows) {
  return Object.fromEntries(rows.map((s) => [s.tag, { name: s.name, description: s.description }]))
}

export async function fetchEntries() {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(fromRow)
}

// The names the System has given to the user's skills.
export async function fetchSkillNames() {
  const { data, error } = await supabase.from('skills').select('tag, name, description')
  if (error) throw error
  return namesFromRows(data)
}

// { [activity]: path }, as sorted by the System.
export async function fetchActivityPaths() {
  const { data, error } = await supabase.from('activities').select('tag, path')
  if (error) throw error
  return Object.fromEntries(data.map((a) => [a.tag, a.path]))
}

// The user's class, or null before it has been assigned.
export async function fetchClass() {
  const { data, error } = await supabase.from('classes').select('*').maybeSingle()
  if (error) throw error
  return classFromRow(data)
}

// Sends the entry to the score-entry Edge Function, which asks the AI to score
// it, saves it, names any skill it unlocked, and assigns or evolves the class.
// Returns { entry, newSkillNames, activityPaths, playerClass }.
export async function submitEntry(text) {
  // The user's time zone, so "days in a row" are counted in their own days.
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const { data, error } = await supabase.functions.invoke('score-entry', { body: { text, timeZone } })
  if (error) {
    // Pull the friendly message out of the function's error response if there is one.
    const body = await error.context?.json?.().catch(() => null)
    throw new Error(body?.error ?? 'The System is silent. Try again.')
  }
  return {
    entry: fromRow(data.entry),
    newSkillNames: namesFromRows(data.newSkills ?? []),
    activityPaths: data.activityPaths ?? {},
    playerClass: classFromRow(data.playerClass),
  }
}

// { [achievement key]: earnedAt }
export async function fetchAchievements() {
  const { data, error } = await supabase.from('achievements').select('key, earned_at')
  if (error) throw error
  return Object.fromEntries(data.map((a) => [a.key, a.earned_at]))
}

// Records newly earned achievements. Saving one twice is harmless.
export async function saveAchievements(keys) {
  const { error } = await supabase
    .from('achievements')
    .upsert(keys.map((key) => ({ key })), { onConflict: 'user_id,key', ignoreDuplicates: true })
  if (error) throw error
}

// The title the user has chosen to wear, or null.
export async function fetchWornTitle() {
  const { data, error } = await supabase.from('profiles').select('worn_title').maybeSingle()
  if (error) throw error
  return data?.worn_title ?? null
}

export async function saveWornTitle(title, userId) {
  const { error } = await supabase
    .from('profiles')
    .upsert({ user_id: userId, worn_title: title, updated_at: new Date().toISOString() })
  if (error) throw error
}

// { [week start "YYYY-MM-DD"]: { summary, facts } }
function summariesFromRows(rows) {
  return Object.fromEntries(rows.map((s) => [s.week_start, { summary: s.summary, facts: s.facts ?? {} }]))
}

export async function fetchWeeklySummaries() {
  const { data, error } = await supabase.from('weekly_summaries').select('week_start, summary, facts')
  if (error) throw error
  return summariesFromRows(data)
}

// Asks the weekly-judgement Edge Function to judge a finished week (once).
// `week` is { key, start, end } from lastCompletedWeek().
export async function requestWeeklySummary(week, facts) {
  const { data, error } = await supabase.functions.invoke('weekly-judgement', {
    body: { weekStart: week.key, start: week.start.toISOString(), end: week.end.toISOString(), facts },
  })
  if (error) throw error
  return summariesFromRows([data.summary])
}
