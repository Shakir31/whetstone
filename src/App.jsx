import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import AuthPage from './pages/AuthPage.jsx'
import JournalPage from './pages/JournalPage.jsx'
import StatusPage from './pages/StatusPage.jsx'
import ChroniclePage from './pages/ChroniclePage.jsx'
import { supabase } from './lib/supabase.js'
import { fetchEntries, fetchSkillNames } from './lib/entries.js'
import { computeStats } from './lib/stats.js'
import { computeSkills } from './lib/skills.js'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = still checking
  const [entries, setEntries] = useState([])
  const [skillNames, setSkillNames] = useState({}) // { [tag]: { name, description } }
  const [loadError, setLoadError] = useState(null)

  // Keep track of whether the user is signed in.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession))
    return () => data.subscription.unsubscribe()
  }, [])

  // Load the user's entries and skill names whenever they sign in.
  const userId = session?.user.id
  useEffect(() => {
    setEntries([])
    setSkillNames({})
    setLoadError(null)
    if (!userId) return
    // Skill names are a nice-to-have: without them, skills show their activity name.
    const names = fetchSkillNames().catch((err) => {
      console.warn('Skill names could not be loaded', err)
      return {}
    })
    Promise.all([fetchEntries(), names])
      .then(([loadedEntries, loadedNames]) => {
        setEntries(loadedEntries)
        setSkillNames(loadedNames)
      })
      .catch(() => setLoadError('The record could not be retrieved. Reload the page.'))
  }, [userId])

  const stats = useMemo(() => computeStats(entries), [entries])
  const skills = useMemo(() => computeSkills(entries), [entries])

  const addEntry = useCallback((entry, newSkillNames = {}) => {
    setEntries((prev) => [entry, ...prev])
    setSkillNames((prev) => ({ ...prev, ...newSkillNames }))
  }, [])

  if (session === undefined) return <div className="surface" />
  if (session === null) return <AuthPage />

  // Everything the pages need, shared through the layout.
  const context = { entries, stats, skills, skillNames, addEntry, loadError }

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
