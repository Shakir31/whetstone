import { Meter } from '../ui/whetstone.jsx'
import { statLevels } from '../lib/stats.js'
import { plural } from '../lib/format.js'
import StreakPips from './StreakPips.jsx'

// The compact row of stats at the top of the Journal.
export default function StatsStrip({ stats }) {
  const levels = statLevels(stats)

  return (
    <section aria-label="Stats" className="stats-strip ws-worn">
      {[
        ['Body', levels.body],
        ['Mind', levels.mind],
        ['Will', levels.will],
      ].map(([name, { level, progress }]) => (
        <div key={name} className="stats-strip__cell">
          <div className="stats-strip__top">
            <span className="ws-label stats-strip__name">{name}</span>
            <span className="ws-numeral">Lv. {level}</span>
          </div>
          <div className="stats-strip__meter">
            <Meter label={`${name}, progress to Lv. ${level + 1}`} progress={progress} />
            <span className="ws-micro meter-pct">{progress}%</span>
          </div>
        </div>
      ))}

      <div className="stats-strip__cell">
        <div className="stats-strip__top">
          <span className="ws-label stats-strip__name">Streak</span>
          <span className="ws-numeral">{plural(stats.currentStreak, 'day')}</span>
        </div>
        <div className="stats-strip__meter">
          <StreakPips done={stats.willCycleDone} total={stats.willCycleLength} />
          <span className="ws-small">
            {stats.daysToNextWill} more for Will Lv. {stats.will + 1}
          </span>
        </div>
      </div>
    </section>
  )
}
