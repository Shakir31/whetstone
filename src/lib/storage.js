// TEMPORARY: entries are saved in the browser (localStorage).
// Later this will be replaced by the Supabase database.

const KEY = 'soul-journal.entries'

export function loadEntries() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? []
  } catch {
    return []
  }
}

export function saveEntries(entries) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries))
  } catch {
    // Storage unavailable (e.g. private mode) — entries just won't persist.
  }
}
