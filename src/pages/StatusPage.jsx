import { useOutletContext } from 'react-router-dom'
import { Meter, Panel, Tag } from '../ui/whetstone.jsx'
import { statLevels } from '../lib/stats.js'
import { plural } from '../lib/format.js'
import StreakPips from '../components/StreakPips.jsx'
import { LockIcon } from '../components/Icons.jsx'

// Will level at which a class is assigned (feature not built yet).
const CLASS_UNLOCK_WILL = 5

const ATTRIBUTES = [
  { key: 'body', name: 'Body', description: 'Physical exertion.' },
  { key: 'mind', name: 'Mind', description: 'Deliberate mental effort.' },
  { key: 'will', name: 'Will', description: 'Discipline through consistency.' },
]

export default function StatusPage() {
  const { stats } = useOutletContext()
  const levels = statLevels(stats)

  return (
    <main className="page page--status">
      <div className="page-head page-head--ruled">
        <span className="ws-micro page-head__eyebrow">Character</span>
        <h1 className="ws-title">Status</h1>
      </div>

      <div className="status-grid">
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

          <Panel title="Class" actions={<Tag>Sealed</Tag>} className="side-panel">
            <div className="sealed">
              <LockIcon />
              <p className="sealed__text">Sealed. Reach Will Lv. {CLASS_UNLOCK_WILL}.</p>
              <span className="ws-micro sealed__meta">
                Will Lv. {Math.min(stats.will, CLASS_UNLOCK_WILL)} of {CLASS_UNLOCK_WILL}
              </span>
            </div>
          </Panel>

          <Panel title="Skills" actions={<Tag>Sealed</Tag>} className="side-panel">
            <div className="sealed">
              <div className="sealed__slots" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
              <p className="sealed__text">Skills are not chosen. They are earned by the same deed, repeated over many days.</p>
            </div>
          </Panel>
        </div>
      </div>
    </main>
  )
}
