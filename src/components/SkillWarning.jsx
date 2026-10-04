import { SystemMessage } from '../ui/whetstone.jsx'
import { isWeakening, numeral, skillName } from '../lib/skills.js'

// A System warning on the Journal for skills about to weaken from neglect.
export default function SkillWarning({ skills, skillNames }) {
  const atRisk = Object.values(skills)
    .filter(isWeakening)
    .sort((a, b) => a.daysUntilDemotion - b.daysUntilDemotion)

  if (atRisk.length === 0) return null

  return (
    <SystemMessage kind="warning">
      {atRisk.map((s) => (
        <p key={s.tag}>
          {skillName(s.tag, skillNames)} {numeral(s.rank)} weakens{' '}
          {s.daysUntilDemotion === 1 ? 'after today' : `in ${s.daysUntilDemotion} days`} unless the deed is repeated.
        </p>
      ))}
    </SystemMessage>
  )
}
