import { useOutletContext } from 'react-router-dom'
import { Meter, Panel } from '../ui/whetstone.jsx'
import { statLevels } from '../lib/stats.js'
import { plural } from '../lib/format.js'
import StreakPips from '../components/StreakPips.jsx'
import SkillsPanel from '../components/SkillsPanel.jsx'
import ClassPanel from '../components/ClassPanel.jsx'
import AchievementsPanel from '../components/AchievementsPanel.jsx'

const ATTRIBUTES = [
  { key: 'body', name: 'Body', description: 'Physical exertion.' },
  { key: 'mind', name: 'Mind', description: 'Deliberate mental effort.' },
  { key: 'will', name: 'Will', description: 'Discipline through consistency.' },
]

export default function StatusPage() {
  const { entries, stats, skills, skillNames, activityPaths, playerClass, achievements, wornTitle, wearTitle } =
    useOutletContext()
  const levels = statLevels(stats)

  return (
    <main className="page page--status">
      <div className="page-head page-head--ruled page-head--split">
        <div className="page-head">
          <span className="ws-micro page-head__eyebrow">Character</span>
          <h1 className="ws-title">Status</h1>
        </div>
        {wornTitle && (
          <div className="worn-title">
            <span className="ws-micro page-head__eyebrow">Title</span>
            <p className="worn-title__text">{wornTitle}</p>
          </div>
        )}
      </div>

      <div className="status-grid">
        <div className="status-main">
          <Panel aria-label="Attributes" className="attributes">
            <ul className="attributes__list">
              {ATTRIBUTES.map(({ key, name, description }) => {
                const { level, progress } = levels[key]
                return (
                  <li key={key} className="attribute">
                    <div className="attribute__top">
                      <div className="attribute__titles">
                        <h2 className="attribute__name">{name}</h2>
                        <p className="attribute__desc">{description}</p>
                      </div>
                      <p className="attribute__level">Lv. {level}</p>
                    </div>
                    <div className="attribute__meter">
                      <Meter label={`${name}, progress to Lv. ${level + 1}`} progress={progress} className="meter--large" />
                      <span className="ws-label meter-pct">{progress}%</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </Panel>

          <AchievementsPanel achievements={achievements} wornTitle={wornTitle} onWear={wearTitle} />
        </div>

        <div className="status-side">
          <Panel title="Streak" className="side-panel">
            <dl className="streak-grid">
              <div>
                <dt className="ws-micro">Current</dt>
                <dd className="ws-numeral">{plural(stats.currentStreak, 'day')}</dd>
              </div>
              <div>
                <dt className="ws-micro">Longest</dt>
                <dd className="ws-numeral">{plural(stats.longestStreak, 'day')}</dd>
              </div>
            </dl>
            <div className="streak-progress">
              <StreakPips done={stats.willCycleDone} total={stats.willCycleLength} />
              <span className="ws-small">
                {stats.daysToNextWill} more for Will Lv. {stats.will + 1}
              </span>
            </div>
          </Panel>

          <ClassPanel playerClass={playerClass} will={stats.will} entries={entries} activityPaths={activityPaths} />

          <SkillsPanel skills={skills} skillNames={skillNames} />
        </div>
      </div>
    </main>
  )
}
