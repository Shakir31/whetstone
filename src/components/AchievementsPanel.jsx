import { Button, Panel, Tag } from '../ui/whetstone.jsx'
import { ACHIEVEMENTS, ACHIEVEMENT_GROUPS } from '../lib/achievements.js'
import { dayMonth } from '../lib/format.js'

export default function AchievementsPanel({ achievements, wornTitle, onWear }) {
  const earnedCount = ACHIEVEMENTS.filter((a) => achievements[a.key]).length

  return (
    <Panel title="Achievements" actions={<Tag>{`${earnedCount} / ${ACHIEVEMENTS.length}`}</Tag>} className="achievements">
      {ACHIEVEMENT_GROUPS.map((group) => (
        <section key={group} className="achievements__group" aria-label={group}>
          <h3 className="ws-micro achievements__group-name">{group}</h3>
          <ul className="achievements__grid">
            {ACHIEVEMENTS.filter((a) => a.group === group).map((a) => (
              <Achievement
                key={a.key}
                achievement={a}
                earnedAt={achievements[a.key]}
                worn={Boolean(a.title) && a.title === wornTitle}
                onWear={onWear}
              />
            ))}
          </ul>
        </section>
      ))}
    </Panel>
  )
}

function Achievement({ achievement: a, earnedAt, worn, onWear }) {
  // Hidden achievements reveal nothing until earned.
  if (!earnedAt && a.hidden) {
    return (
      <li className="achievement achievement--sealed">
        <span className="ws-label achievement__name">???</span>
        <span className="ws-small">Hidden.</span>
      </li>
    )
  }

  return (
    <li className={`achievement${earnedAt ? ' achievement--earned' : ' achievement--sealed'}`}>
      <span className="ws-label achievement__name">{a.name}</span>
      <span className="ws-small">{a.how}</span>
      {a.title && <span className="achievement__title">Title: {a.title}</span>}
      <div className="achievement__foot">
        <span className="ws-micro achievement__state">
          {earnedAt ? `Earned ${dayMonth(earnedAt)}` : 'Sealed'}
        </span>
        {earnedAt && a.title && (
          <Button size="sm" variant={worn ? 'ghost' : 'secondary'} onClick={() => onWear(worn ? null : a.title)}>
            {worn ? 'Remove' : 'Wear'}
          </Button>
        )}
      </div>
    </li>
  )
}
