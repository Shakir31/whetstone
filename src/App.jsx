import { useEffect, useMemo, useState } from 'react'
import AuthForm from './components/AuthForm.jsx'
import EntryForm from './components/EntryForm.jsx'
import StatsPanel from './components/StatsPanel.jsx'
import SystemMessage from './components/SystemMessage.jsx'
import EntryList from './components/EntryList.jsx'
import { supabase } from './lib/supabase.js'
import { fetchEntries, submitEntry } from './lib/entries.js'
import { computeStats } from './lib/stats.js'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = still checking
  const [entries, setEntries] = useState([])
  const [latestEntry, setLatestEntry] = useState(null)
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
    setLatestEntry(null)
    setLoadError(null)
    if (!userId) return
    fetchEntries()
      .then(setEntries)
      .catch(() => setLoadError('Your past entries could not be loaded.'))
  }, [userId])

  const stats = useMemo(() => computeStats(entries), [entries])

  async function handleSubmit(text) {
    const entry = await submitEntry(text)
    setEntries((prev) => [entry, ...prev])
    setLatestEntry(entry)
  }

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
          {latestEntry && (
            <SystemMessage entry={latestEntry} onDismiss={() => setLatestEntry(null)} />
          )}
          {loadError && <p className="form-message">{loadError}</p>}
          <EntryList entries={entries} />
        </>
      )}
    </main>
  )
}
