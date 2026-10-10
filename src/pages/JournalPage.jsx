import { useCallback, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import StatsStrip from '../components/StatsStrip.jsx'
import EntryForm from '../components/EntryForm.jsx'
import RecentEntries from '../components/RecentEntries.jsx'
import JudgementOverlay from '../components/JudgementOverlay.jsx'
import SkillWarning from '../components/SkillWarning.jsx'
import WeeklySummary from '../components/WeeklySummary.jsx'
import { submitEntry } from '../lib/entries.js'
import { computeStats } from '../lib/stats.js'
import { computeSkills, skillEvents } from '../lib/skills.js'
import { classDayOf, classEvent } from '../lib/classes.js'
import { ACHIEVEMENTS_BY_KEY, earnedKeys } from '../lib/achievements.js'
import { lastCompletedWeek } from '../lib/weekly.js'
import { longDate } from '../lib/format.js'

export default function JournalPage() {
  const {
    entries,
    stats,
    skills,
    skillNames,
    activityPaths,
    playerClass,
    achievements,
    weeklySummaries,
    addEntry,
    loadError,
  } = useOutletContext()
  const lastWeek = lastCompletedWeek()
  const [result, setResult] = useState(null) // what the judgement reveal shows, or null

  // Errors are thrown on to EntryForm, which shows the message.
  async function handleSubmit(text) {
    const submitted = await submitEntry(text)
    const { entry, newSkillNames } = submitted
    const allEntries = [entry, ...entries]
    const classAfter = submitted.playerClass ?? playerClass
    const classDayAfter = classDayOf(classAfter)
    const pathsAfter = { ...activityPaths, ...submitted.activityPaths }
    const statsAfter = computeStats(allEntries, classDayAfter)
    const skillsAfter = computeSkills(allEntries, new Date(), pathsAfter)
    const newAchievements = earnedKeys({
      entries: allEntries,
      stats: statsAfter,
      skills: skillsAfter,
      playerClass: classAfter,
      classDay: classDayAfter,
    })
      .filter((key) => !(key in achievements))
      .map((key) => ACHIEVEMENTS_BY_KEY[key])

    addEntry(submitted)
    setResult({
      entry,
      before: stats,
      after: statsAfter,
      skillEvents: skillEvents(skills, skillsAfter),
      skillNames: { ...skillNames, ...newSkillNames },
      classEvent: classEvent(
        { playerClass, entries, paths: activityPaths },
        { playerClass: classAfter, entries: allEntries, paths: pathsAfter },
      ),
      achievementEvents: newAchievements,
    })
  }

  const closeResult = useCallback(() => setResult(null), [])

  return (
    <main className="page page--journal">
      <StatsStrip stats={stats} />
      {weeklySummaries[lastWeek.key] && (
        <WeeklySummary weekKey={lastWeek.key} summary={weeklySummaries[lastWeek.key]} dismissible />
      )}
      <SkillWarning skills={skills} skillNames={skillNames} />

      <section aria-labelledby="today-title" className="today">
        <div className="page-head">
          <span className="ws-micro page-head__eyebrow">{longDate(new Date())}</span>
          <h1 id="today-title" className="ws-title">
            Today's deeds
          </h1>
        </div>
        <EntryForm onSubmit={handleSubmit} />
      </section>

      {loadError && <p className="form-error">{loadError}</p>}
      <RecentEntries entries={entries} />

      {result && <JudgementOverlay {...result} onClose={closeResult} />}
    </main>
  )
}
