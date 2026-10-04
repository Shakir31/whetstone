import { supabase } from './supabase.js'

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

// Sends the entry to the score-entry Edge Function, which asks the AI to score
// it, saves it, and names any skill it unlocked.
// Returns { entry, newSkillNames }.
export async function submitEntry(text) {
  // The user's time zone, so "days in a row" are counted in their own days.
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const { data, error } = await supabase.functions.invoke('score-entry', { body: { text, timeZone } })
  if (error) {
    // Pull the friendly message out of the function's error response if there is one.
    const body = await error.context?.json?.().catch(() => null)
    throw new Error(body?.error ?? 'The System is silent. Try again.')
  }
  return { entry: fromRow(data.entry), newSkillNames: namesFromRows(data.newSkills ?? []) }
}
