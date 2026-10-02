import { supabase } from './supabase.js'

// Database rows use snake_case; the app uses camelCase.
function fromRow(row) {
  return {
    id: row.id,
    text: row.text,
    body: Number(row.body),
    mind: Number(row.mind),
    tags: row.tags,
    systemMessage: row.system_message,
    createdAt: row.created_at,
  }
}

export async function fetchEntries() {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(fromRow)
}

// Sends the entry to the score-entry Edge Function, which asks the AI to score
// it and saves it. Returns the saved entry.
export async function submitEntry(text) {
  const { data, error } = await supabase.functions.invoke('score-entry', { body: { text } })
  if (error) {
    // Pull the friendly message out of the function's error response if there is one.
    const body = await error.context?.json?.().catch(() => null)
    throw new Error(body?.error ?? 'The System is silent. Try again.')
  }
  return fromRow(data.entry)
}
