import { useCallback, useEffect, useMemo, useState } from 'react'
import AuthForm from './components/AuthForm.jsx'
import EntryForm from './components/EntryForm.jsx'
import StatsPanel from './components/StatsPanel.jsx'
import SystemOverlay from './components/SystemOverlay.jsx'
import EntryList from './components/EntryList.jsx'
import { supabase } from './lib/supabase.js'
import { fetchEntries, submitEntry } from './lib/entries.js'
import { computeStats } from './lib/stats.js'

// Keep the "judging" screen up at least this long so the moment has weight.
const MIN_JUDGING_MS = 1500

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = still checking
  const [entries, setEntries] = useState([])
  const [overlay, setOverlay] = useState(null) // null | { result: null | { entry, before, after } }
  const [loadError, setLoadError] = useState(null)

  // Keep track of whether the user is signed in.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession))
    return () => data.subscription.unsubscribe()
  }, [])

  // Load the user's entries whenever they sign in.
  const userId = session?.user.id
  useEffect(() => {
    setEntries([])
    setOverlay(null)
    setLoadError(null)
    if (!userId) return
    fetchEntries()
      .then(setEntries)
      .catch(() => setLoadError('Your past entries could not be loaded.'))
  }, [userId])

  const stats = useMemo(() => computeStats(entries), [entries])

  async function handleSubmit(text) {
    setOverlay({ result: null })
    try {
      const [entry] = await Promise.all([
        submitEntry(text),
        new Promise((resolve) => setTimeout(resolve, MIN_JUDGING_MS)),
      ])
      const after = computeStats([entry, ...entries])
      setEntries((prev) => [entry, ...prev])
      setOverlay({ result: { entry, before: stats, after } })
    } catch (err) {
      setOverlay(null)
      throw err // EntryForm shows the message
    }
  }

  const closeOverlay = useCallback(() => setOverlay(null), [])

  return (
    <main className="app">
      <header className="app-header">
        <h1>Soul Journal</h1>
        <p className="subtitle">Record your deeds. The System will judge them.</p>
        {session && (
          <button type="button" className="link" onClick={() => supabase.auth.signOut()}>
            Sign out
          </button>
        )}
      </header>

      {session === null && <AuthForm />}

      {session && (
        <>
          <StatsPanel stats={stats} />
          <EntryForm onSubmit={handleSubmit} />
          {loadError && <p className="form-message">{loadError}</p>}
          <EntryList entries={entries} />
        </>
      )}

      {overlay && <SystemOverlay result={overlay.result} onClose={closeOverlay} />}
    </main>
  )
}
