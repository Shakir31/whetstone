import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import AuthPage from './pages/AuthPage.jsx'
import JournalPage from './pages/JournalPage.jsx'
import StatusPage from './pages/StatusPage.jsx'
import ChroniclePage from './pages/ChroniclePage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import CodexPage from './pages/CodexPage.jsx'
import LandingPage from './pages/LandingPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import IntroPage, { introSeen } from './pages/IntroPage.jsx'
import LegalPage from './pages/LegalPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import { supabase } from './lib/supabase.js'
import {
  fetchAchievements,
  fetchActivityPaths,
  fetchClass,
  fetchEntries,
  fetchSkillNames,
  fetchWeeklySummaries,
  fetchWornTitle,
  requestWeeklySummary,
  saveAchievements,
  saveWornTitle,
} from './lib/entries.js'
import { computeStats } from './lib/stats.js'
import { computeSkills } from './lib/skills.js'
import { classDayOf } from './lib/classes.js'
import { earnedKeys } from './lib/achievements.js'
import { lastCompletedWeek, weekFacts } from './lib/weekly.js'

// Loads something the app can live without, falling back if it fails.
function optional(promise, fallback, what) {
  return promise.catch((err) => {
    console.warn(`${what} could not be loaded`, err)
    return fallback
  })
}

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = still checking
  const [loaded, setLoaded] = useState(false)
  const [entries, setEntries] = useState([])
  const [skillNames, setSkillNames] = useState({}) // { [tag]: { name, description } }
  const [activityPaths, setActivityPaths] = useState({}) // { [tag]: path }
  const [playerClass, setPlayerClass] = useState(null)
  const [achievements, setAchievements] = useState({}) // { [key]: earnedAt }
  const [wornTitle, setWornTitle] = useState(null)
  const [weeklySummaries, setWeeklySummaries] = useState({}) // { [week start]: { summary, facts } }
  // Kept in state (not just read from storage) so finishing the introduction
  // immediately changes what the Journal route shows.
  const [introDone, setIntroDone] = useState(introSeen)
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
    setLoaded(false)
    setEntries([])
    setSkillNames({})
    setActivityPaths({})
    setPlayerClass(null)
    setAchievements({})
    setWornTitle(null)
    setWeeklySummaries({})
    setLoadError(null)
    if (!userId) return
    // Only the entries are essential; without the rest, the app just shows less.
    Promise.all([
      fetchEntries(),
      optional(fetchSkillNames(), {}, 'Skill names'),
      optional(fetchActivityPaths(), {}, 'Activity paths'),
      optional(fetchClass(), null, 'Class'),
      optional(fetchAchievements(), {}, 'Achievements'),
      optional(fetchWornTitle(), null, 'Worn title'),
      optional(fetchWeeklySummaries(), {}, 'Weekly summaries'),
    ])
      .then(([loadedEntries, names, paths, loadedClass, earned, title, summaries]) => {
        setEntries(loadedEntries)
        setSkillNames(names)
        setActivityPaths(paths)
        setPlayerClass(loadedClass)
        setAchievements(earned)
        setWornTitle(title)
        setWeeklySummaries(summaries)
        setLoaded(true)
      })
      .catch(() => setLoadError('The record could not be retrieved. Reload the page.'))
  }, [userId])

  const classDay = classDayOf(playerClass)
  const stats = useMemo(() => computeStats(entries, classDay), [entries, classDay])
  const skills = useMemo(() => computeSkills(entries), [entries])

  // Record any achievement the record now meets but that hasn't been saved yet.
  useEffect(() => {
    if (!loaded) return
    const missing = earnedKeys({ entries, stats, skills, playerClass, classDay }).filter((k) => !(k in achievements))
    if (missing.length === 0) return
    const now = new Date().toISOString()
    setAchievements((prev) => ({ ...prev, ...Object.fromEntries(missing.map((k) => [k, now])) }))
    saveAchievements(missing).catch((err) => console.warn('Achievements could not be saved', err))
  }, [loaded, entries, stats, skills, playerClass, classDay, achievements])

  // Once a week has ended, ask the System to judge it (once per week). Only
  // for people who were already recording before the current week began.
  const requestedWeek = useRef(null)
  useEffect(() => {
    if (!loaded) return
    const week = lastCompletedWeek()
    const requestKey = `${userId}:${week.key}`
    if (weeklySummaries[week.key] || requestedWeek.current === requestKey) return
    if (!entries.some((e) => Date.parse(e.createdAt) < week.end.getTime())) return
    requestedWeek.current = requestKey
    requestWeeklySummary(week, weekFacts(entries, week, { classDay, skillNames }))
      .then((summary) => setWeeklySummaries((prev) => ({ ...prev, ...summary })))
      .catch((err) => console.warn('The week could not be judged', err))
  }, [loaded, userId, entries, weeklySummaries, classDay, skillNames])

  // Takes what submitEntry() returns.
  const addEntry = useCallback(({ entry, newSkillNames, activityPaths: newPaths, playerClass: newClass }) => {
    setEntries((prev) => [entry, ...prev])
    setSkillNames((prev) => ({ ...prev, ...newSkillNames }))
    setActivityPaths((prev) => ({ ...prev, ...newPaths }))
    if (newClass) setPlayerClass(newClass)
  }, [])

  const wearTitle = useCallback(
    (title) => {
      setWornTitle(title)
      saveWornTitle(title, userId).catch((err) => console.warn('The title could not be saved', err))
    },
    [userId],
  )

  if (session === undefined) return <div className="surface" />

  // Not signed in: the public pages. The app's own pages lead to sign in.
  if (session === null) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<AuthPage mode="signIn" />} />
        <Route path="/signup" element={<AuthPage mode="signUp" />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage signedIn={false} />} />
        <Route path="/privacy" element={<LegalPage doc="privacy" />} />
        <Route path="/terms" element={<LegalPage doc="terms" />} />
        {APP_PATHS.map((path) => (
          <Route key={path} path={path} element={<Navigate to="/signin" replace />} />
        ))}
        <Route path="*" element={<NotFoundPage signedIn={false} />} />
      </Routes>
    )
  }

  // Someone with no entries yet sees the introduction once.
  const needsIntro = loaded && entries.length === 0 && !introDone

  // Everything the pages need, shared through the layout.
  const context = {
    entries,
    stats,
    skills,
    skillNames,
    activityPaths,
    playerClass,
    classDay,
    achievements,
    wornTitle,
    wearTitle,
    weeklySummaries,
    addEntry,
    loadError,
    email: session.user.email,
  }

  return (
    <Routes>
      <Route element={<AppLayout context={context} />}>
        <Route index element={needsIntro ? <Navigate to="/welcome" replace /> : <JournalPage />} />
        <Route path="status" element={<StatusPage />} />
        <Route path="chronicle" element={<ChroniclePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="codex" element={<CodexPage />} />
      </Route>
      <Route path="/welcome" element={<IntroPage onFinish={() => setIntroDone(true)} />} />
      <Route path="/reset-password" element={<ResetPasswordPage signedIn />} />
      <Route path="/privacy" element={<LegalPage doc="privacy" />} />
      <Route path="/terms" element={<LegalPage doc="terms" />} />
      {PUBLIC_ONLY_PATHS.map((path) => (
        <Route key={path} path={path} element={<Navigate to="/" replace />} />
      ))}
      <Route path="*" element={<NotFoundPage signedIn />} />
    </Routes>
  )
}

// Pages that need an account, and pages only for people without a session.
const APP_PATHS = ['/status', '/chronicle', '/settings', '/codex', '/welcome']
const PUBLIC_ONLY_PATHS = ['/signin', '/signup', '/forgot-password']
