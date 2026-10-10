import { Meter, Panel, Tag } from '../ui/whetstone.jsx'
import {
  CLASSES,
  EVOLVE_AT_RANK,
  FINAL_AT_RANK,
  MAX_CLASS_RANK,
  PATH_NAMES,
  WILL_FOR_CLASS,
  className,
  classProgress,
  evolutionHint,
  finalFormHints,
  readFinalForm,
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
  const final = Boolean(playerClass.finalName)
  const description = final
    ? playerClass.finalDescription
    : evolved
      ? playerClass.evolvedDescription
      : null
  const pathWords = base.path ? `of ${PATH_NAMES[base.path]}` : 'of any deed'

  return (
    <Panel title="Class" actions={<span className="ws-numeral class__rank">{numeral(rank)}</span>} className="side-panel">
      <div className="class">
        <p className="class__name">{className(playerClass)}</p>
        {playerClass.title && <p className="class__title">{playerClass.title}</p>}
        <p className="class__desc">{description || base.description}</p>
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

      {final ? (
        <p className="ws-micro class__lineage">
          Final form of {playerClass.evolvedName} · {finalLineage(playerClass)}
        </p>
      ) : evolved ? (
        <>
          <p className="ws-micro class__lineage">
            Evolved from {base.name}
            {playerClass.evolvedPath && ` · shaped by ${PATH_NAMES[playerClass.evolvedPath]}`}
          </p>
          <FinalFormHint playerClass={playerClass} rank={rank} entries={entries} activityPaths={activityPaths} />
        </>
      ) : (
        <div className="sealed sealed--compact">
          <p className="sealed__text">{evolutionHint(rank, leaning)}</p>
          <span className="ws-micro sealed__meta">Evolves at Rank {numeral(EVOLVE_AT_RANK)}</span>
        </div>
      )}
    </Panel>
  )
}

// Hints toward the final form: vague at Rank III, then two lines from Rank IV —
// what is shaping the form, and how steadily the path is kept.
function FinalFormHint({ playerClass, rank, entries, activityPaths }) {
  const lines =
    rank >= FINAL_AT_RANK - 1
      ? finalFormHints(playerClass, readFinalForm(playerClass, entries, activityPaths))
      : ['The final form is not yet set.']
  return (
    <div className="sealed sealed--compact">
      {lines.map((line) => (
        <p key={line} className="sealed__text">
          {line}
        </p>
      ))}
      <span className="ws-micro sealed__meta">Final form at Rank {numeral(FINAL_AT_RANK)}</span>
    </div>
  )
}

// "Bound to Knowledge · Steadfast"
function finalLineage(playerClass) {
  const temperament = playerClass.finalTemperament
    ? playerClass.finalTemperament.charAt(0).toUpperCase() + playerClass.finalTemperament.slice(1)
    : null
  const outcome = {
    deepened: 'Deepened',
    bound: playerClass.evolvedPath ? `Bound to ${PATH_NAMES[playerClass.evolvedPath]}` : 'Bound',
    turned: playerClass.finalPath ? `Turned to ${PATH_NAMES[playerClass.finalPath]}` : 'Turned',
  }[playerClass.finalOutcome]
  return [outcome, temperament].filter(Boolean).join(' · ')
}
