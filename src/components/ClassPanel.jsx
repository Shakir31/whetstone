import { Meter, Panel, Tag } from '../ui/whetstone.jsx'
import {
  CLASSES,
  EVOLVE_AT_RANK,
  MAX_CLASS_RANK,
  PATH_NAMES,
  WILL_FOR_CLASS,
  className,
  classProgress,
  evolutionHint,
} from '../lib/classes.js'
import { numeral } from '../lib/skills.js'
import { plural } from '../lib/format.js'
import { CLASS_DAILY_CAP } from '../lib/stats.js'
import { LockIcon } from './Icons.jsx'

export default function ClassPanel({ playerClass, will, entries, activityPaths }) {
  if (!playerClass) {
    return (
      <Panel title="Class" actions={<Tag>Sealed</Tag>} className="side-panel">
        <div className="sealed">
          <LockIcon />
          <p className="sealed__text">Sealed. Reach Will Lv. {WILL_FOR_CLASS}.</p>
          <span className="ws-micro sealed__meta">
            Will Lv. {Math.min(will, WILL_FOR_CLASS)} of {WILL_FOR_CLASS}
          </span>
        </div>
      </Panel>
    )
  }

  const base = CLASSES[playerClass.baseClass]
  const { rank, progress, daysToNextRank, leaning } = classProgress(playerClass, entries, activityPaths)
  const evolved = Boolean(playerClass.evolvedName)
  const pathWords = base.path ? `of ${PATH_NAMES[base.path]}` : 'of any deed'

  return (
    <Panel title="Class" actions={<span className="ws-numeral class__rank">{numeral(rank)}</span>} className="side-panel">
      <div className="class">
        <p className="class__name">{className(playerClass)}</p>
        {playerClass.title && <p className="class__title">{playerClass.title}</p>}
        <p className="class__desc">{evolved ? playerClass.evolvedDescription || base.description : base.description}</p>
        <p className="ws-micro class__cap">Daily limit: {CLASS_DAILY_CAP} Body, {CLASS_DAILY_CAP} Mind</p>
      </div>

      <div className="class__progress">
        <div className="attribute__meter">
          <Meter label={`Class progress to Rank ${numeral(rank + 1)}`} progress={progress} />
          <span className="ws-micro meter-pct">{progress}%</span>
        </div>
        <span className="ws-small">
          {rank >= MAX_CLASS_RANK
            ? 'Highest rank.'
            : `${plural(daysToNextRank, 'day')} ${pathWords} for Rank ${numeral(rank + 1)}.`}
        </span>
      </div>

      {evolved ? (
        <p className="ws-micro class__lineage">
          Evolved from {base.name}
          {playerClass.evolvedPath && ` · shaped by ${PATH_NAMES[playerClass.evolvedPath]}`}
        </p>
      ) : (
        <div className="sealed sealed--compact">
          <p className="sealed__text">{evolutionHint(rank, leaning)}</p>
          <span className="ws-micro sealed__meta">Evolves at Rank {numeral(EVOLVE_AT_RANK)}</span>
        </div>
      )}
    </Panel>
  )
}
