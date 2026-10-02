import { statLevels } from '../lib/stats.js'

export default function StatsPanel({ stats }) {
  const levels = statLevels(stats)

  return (
    <section className="panel stats">
      <Stat name="Body" {...levels.body} />
      <Stat name="Mind" {...levels.mind} />
      <Stat name="Will" {...levels.will} />
      <p className="streak">
        Streak: {stats.currentStreak} {stats.currentStreak === 1 ? 'day' : 'days'} ·{' '}
        {stats.daysToNextWill} more for Will Lv. {stats.will + 1}
      </p>
    </section>
  )
}

function Stat({ name, level, progress }) {
  return (
    <div className="stat">
      <span className="stat-name">{name}</span>
      <span className="stat-value">Lv. {level}</span>
      <div className="bar" aria-label={`${progress}% to level ${level + 1}`}>
        <div className="bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <span className="stat-progress">{progress}%</span>
    </div>
  )
}
