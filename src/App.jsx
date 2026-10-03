import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import AuthPage from './pages/AuthPage.jsx'
import JournalPage from './pages/JournalPage.jsx'
import StatusPage from './pages/StatusPage.jsx'
import ChroniclePage from './pages/ChroniclePage.jsx'
import { supabase } from './lib/supabase.js'
import { fetchEntries } from './lib/entries.js'
import { computeStats } from './lib/stats.js'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = still checking
  const [entries, setEntries] = useState([])
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
    setLoadError(null)
    if (!userId) return
    fetchEntries()
      .then(setEntries)
      .catch(() => setLoadError('The record could not be retrieved. Reload the page.'))
  }, [userId])

  const stats = useMemo(() => computeStats(entries), [entries])
  const addEntry = useCallback((entry) => setEntries((prev) => [entry, ...prev]), [])

  if (session === undefined) return <div className="surface" />
  if (session === null) return <AuthPage />

  // Everything the pages need, shared through the layout.
  const context = { entries, stats, addEntry, loadError }

  return (
    <Routes>
      <Route element={<AppLayout context={context} />}>
        <Route index element={<JournalPage />} />
        <Route path="status" element={<StatusPage />} />
        <Route path="chronicle" element={<ChroniclePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
