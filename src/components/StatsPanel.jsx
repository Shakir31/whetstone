export default function StatsPanel({ stats }) {
  return (
    <section className="panel stats">
      <Stat name="Body" value={stats.body} />
      <Stat name="Mind" value={stats.mind} />
      <Stat name="Will" value={stats.will} />
      <p className="streak">
        Streak: {stats.currentStreak} {stats.currentStreak === 1 ? 'day' : 'days'} ·{' '}
        {stats.daysToNextWill} more for +1 Will
      </p>
    </section>
  )
}

function Stat({ name, value }) {
  return (
    <div className="stat">
      <span className="stat-name">{name}</span>
      <span className="stat-value">{value}</span>
    </div>
  )
}
