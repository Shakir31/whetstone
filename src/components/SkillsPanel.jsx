import { Panel, Tag } from '../ui/whetstone.jsx'
import { MAX_RANK, RUN_FOR_RANK, isWeakening, numeral, skillName, titleCase } from '../lib/skills.js'
import { plural } from '../lib/format.js'
import StreakPips from './StreakPips.jsx'

// Show a "Forming" activity once it has this many days in its current run.
const FORMING_MIN_DAYS = 2
const FORMING_SHOWN = 5

export default function SkillsPanel({ skills, skillNames }) {
  const all = Object.values(skills)
  const earned = all
    .filter((s) => s.unlocked)
    .sort((a, b) => b.rank - a.rank || skillName(a.tag, skillNames).localeCompare(skillName(b.tag, skillNames)))
  const forming = all
    .filter((s) => !s.unlocked && s.progress >= FORMING_MIN_DAYS)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, FORMING_SHOWN)

  if (earned.length === 0 && forming.length === 0) {
    return (
      <Panel title="Skills" actions={<Tag>Sealed</Tag>} className="side-panel">
        <div className="sealed">
          <div className="sealed__slots" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <p className="sealed__text">
            Skills are not chosen. They are earned by the same deed, repeated {RUN_FOR_RANK} days in a row.
          </p>
        </div>
      </Panel>
    )
  }

  return (
    <Panel title="Skills" actions={earned.length > 0 && <Tag>{earned.length}</Tag>} className="side-panel">
      {earned.length > 0 && (
        <ul className="skill-list">
          {earned.map((skill) => (
            <SkillItem key={skill.tag} skill={skill} skillNames={skillNames} />
          ))}
        </ul>
      )}

      {forming.length > 0 && (
        <div className="forming">
          <span className="ws-micro forming__title">Forming</span>
          <ul className="forming__list">
            {forming.map((s) => (
              <li key={s.tag} className="forming__item">
                <span className="forming__name">{titleCase(s.tag)}</span>
                <StreakPips done={s.progress} total={RUN_FOR_RANK} />
                <span className="ws-small">{plural(RUN_FOR_RANK - s.progress, 'day')} more</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  )
}

function SkillItem({ skill, skillNames }) {
  const description = skillNames[skill.tag]?.description
  const daysLeft = RUN_FOR_RANK - skill.progress
  const weakening = isWeakening(skill)

  let status
  if (skill.lost) status = `Lost. ${plural(daysLeft, 'day')} in a row to restore.`
  else if (weakening) {
    status = skill.daysUntilDemotion === 1 ? 'Weakens after today.' : `Weakens in ${skill.daysUntilDemotion} days.`
  } else if (skill.rank >= MAX_RANK) status = 'Highest rank. Hold it.'
  else status = `${plural(daysLeft, 'day')} more for Rank ${numeral(skill.rank + 1)}.`

  return (
    <li className={`skill${skill.lost ? ' skill--lost' : ''}`}>
      <div className="skill__top">
        <span className="skill__name">{skillName(skill.tag, skillNames)}</span>
        {skill.lost ? <Tag>Lost</Tag> : <span className="ws-numeral skill__rank">{numeral(skill.rank)}</span>}
      </div>
      {description && <p className="skill__desc">{description}</p>}
      <div className="skill__foot">
        <span className="ws-micro skill__tag">{skill.tag}</span>
        {skill.rank < MAX_RANK && <StreakPips done={skill.progress} total={RUN_FOR_RANK} />}
        <span className={`ws-small${weakening ? ' skill__status--warn' : ''}`}>{status}</span>
      </div>
    </li>
  )
}
