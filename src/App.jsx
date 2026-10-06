import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import AuthPage from './pages/AuthPage.jsx'
import JournalPage from './pages/JournalPage.jsx'
import StatusPage from './pages/StatusPage.jsx'
import ChroniclePage from './pages/ChroniclePage.jsx'
import { supabase } from './lib/supabase.js'
import { fetchActivityPaths, fetchClass, fetchEntries, fetchSkillNames } from './lib/entries.js'
import { computeStats } from './lib/stats.js'
import { computeSkills } from './lib/skills.js'
import { classDayOf } from './lib/classes.js'

// Loads something the app can live without, falling back if it fails.
function optional(promise, fallback, what) {
  return promise.catch((err) => {
    console.warn(`${what} could not be loaded`, err)
    return fallback
  })
}

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = still checking
  const [entries, setEntries] = useState([])
  const [skillNames, setSkillNames] = useState({}) // { [tag]: { name, description } }
  const [activityPaths, setActivityPaths] = useState({}) // { [tag]: path }
  const [playerClass, setPlayerClass] = useState(null)
  const [loadError, setLoadError] = useState(null)

  // Keep track of whether the user is signed in.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession))
    return () => data.subscription.unsubscribe()
  }, [])

  // Load the user's record whenever they sign in.
  const userId = session?.user.id
  useEffect(() => {
    setEntries([])
    setSkillNames({})
    setActivityPaths({})
    setPlayerClass(null)
    setLoadError(null)
    if (!userId) return
    // Only the entries are essential; without the rest, skills and the class just show less.
    Promise.all([
      fetchEntries(),
      optional(fetchSkillNames(), {}, 'Skill names'),
      optional(fetchActivityPaths(), {}, 'Activity paths'),
      optional(fetchClass(), null, 'Class'),
    ])
      .then(([loadedEntries, loadedNames, loadedPaths, loadedClass]) => {
        setEntries(loadedEntries)
        setSkillNames(loadedNames)
        setActivityPaths(loadedPaths)
        setPlayerClass(loadedClass)
      })
      .catch(() => setLoadError('The record could not be retrieved. Reload the page.'))
  }, [userId])

  const classDay = classDayOf(playerClass)
  const stats = useMemo(() => computeStats(entries, classDay), [entries, classDay])
  const skills = useMemo(() => computeSkills(entries), [entries])

  // Takes what submitEntry() returns.
  const addEntry = useCallback(({ entry, newSkillNames, activityPaths: newPaths, playerClass: newClass }) => {
    setEntries((prev) => [entry, ...prev])
    setSkillNames((prev) => ({ ...prev, ...newSkillNames }))
    setActivityPaths((prev) => ({ ...prev, ...newPaths }))
    if (newClass) setPlayerClass(newClass)
  }, [])

  if (session === undefined) return <div className="surface" />
  if (session === null) return <AuthPage />

  // Everything the pages need, shared through the layout.
  const context = { entries, stats, skills, skillNames, activityPaths, playerClass, addEntry, loadError }

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
