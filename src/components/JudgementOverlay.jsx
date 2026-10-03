import { useEffect, useState } from 'react'
import { Button, LevelUp, SystemMessage } from '../ui/whetstone.jsx'
import { statLevels } from '../lib/stats.js'
import { time } from '../lib/format.js'

// Timing of the reveal, in milliseconds.
const ROWS_START = 1000 // after the verdict has faded in
const ROW_STAGGER = 600
const BAR_FILL = 1400 // keep in sync with --duration-fill in tokens.css
const CONTINUE_AFTER = 1200
const CEREMONY = 2600 // the LEVEL UP ceremony, including its internal delays

const STAT_NAMES = { body: 'Body', mind: 'Mind', will: 'Will' }
const LEVEL_UP_NOTES = {
  body: 'The flesh has hardened.',
  mind: 'The mind has sharpened.',
  will: 'Discipline has taken root.',
}

// Full-screen overlay shown while an entry is judged, then the reveal.
// `result` is null while judging, or { entry, before, after } once scored.
export default function JudgementOverlay({ result, onClose }) {
  return (
    <div className="judgement" role="dialog" aria-modal="true" aria-label="Judgement" aria-live="polite">
      {result ? <Reveal {...result} onClose={onClose} /> : <p className="judgement__waiting">The System is judging…</p>}
    </div>
  )
}

function Reveal({ entry, before, after, onClose }) {
  const rows = gainRows(entry, before, after)
  const levelUps = rows.filter((row) => row.to.level > row.from.level)

  const rowsDone = ROWS_START + rows.length * ROW_STAGGER + BAR_FILL
  const levelUpAt = rowsDone
  const continueAt = levelUps.length ? levelUpAt + CEREMONY : rowsDone + CONTINUE_AFTER

  const [showLevelUps, setShowLevelUps] = useState(false)
  const [canContinue, setCanContinue] = useState(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => setShowLevelUps(true), levelUpAt),
      setTimeout(() => setCanContinue(true), continueAt),
    ]
    return () => timers.forEach(clearTimeout)
  }, [levelUpAt, continueAt])

  useEffect(() => {
    if (!canContinue) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canContinue, onClose])

  return (
    <div className="judgement__reveal">
      <SystemMessage kind="verdict" meta={time(entry.createdAt)}>
        <p className="judgement__verdict">{entry.systemMessage}</p>
      </SystemMessage>

      {rows.length > 0 && (
        <div className="judgement__gains">
          {rows.map((row, i) => (
            <GainRow key={row.stat} {...row} delay={ROWS_START + i * ROW_STAGGER} />
          ))}
        </div>
      )}

      {showLevelUps &&
        levelUps.map((row) => (
          <LevelUp
            key={row.stat}
            stat={STAT_NAMES[row.stat]}
            from={row.from.level}
            to={row.to.level}
            note={LEVEL_UP_NOTES[row.stat]}
          />
        ))}

      {canContinue && (
        <Button variant="primary" className="judgement__continue" onClick={onClose} autoFocus>
          Continue
        </Button>
      )}
    </div>
  )
}

// Which stat rows to show, based on how the totals changed.
function gainRows(entry, before, after) {
  const from = statLevels(before)
  const to = statLevels(after)
  const rows = []

  for (const stat of ['body', 'mind']) {
    const gained = Math.round((after[stat] - before[stat]) * 10) / 10
    if (gained > 0) {
      rows.push({ stat, from: from[stat], to: to[stat], amount: `+${gained}` })
    } else if (entry[stat] > 0) {
      // The AI awarded points but the daily cap absorbed them.
      rows.push({ stat, from: from[stat], to: to[stat], note: "The day's limit has been reached." })
    }
  }

  if (to.will.level !== from.will.level || to.will.progress !== from.will.progress) {
    rows.push({ stat: 'will', from: from.will, to: to.will })
  }
  return rows
}

// One stat bar that fills from the old value to the new one. On a level up it
// fills to the end, the level number turns over, and it fills again.
function GainRow({ stat, from, to, amount, note, delay }) {
  const [level, setLevel] = useState(from.level)
  const [width, setWidth] = useState(from.progress)
  const [animate, setAnimate] = useState(true)

  useEffect(() => {
    const timers = []
    const at = (ms, fn) => timers.push(setTimeout(fn, ms))

    if (to.level > from.level) {
      at(delay + 200, () => setWidth(100))
      at(delay + 200 + BAR_FILL, () => {
        setAnimate(false)
        setLevel(to.level)
        setWidth(0)
      })
      at(delay + 250 + BAR_FILL, () => {
        setAnimate(true)
        setWidth(to.progress)
      })
    } else {
      at(delay + 200, () => setWidth(to.progress))
    }
    return () => timers.forEach(clearTimeout)
  }, [delay, from.level, to.level, to.progress])

  return (
    <div className="ws-stat judgement__row" style={{ animationDelay: `${delay}ms` }}>
      <span className="ws-stat__name ws-label">
        {STAT_NAMES[stat]}
        {amount && <span className="judgement__amount">{amount}</span>}
      </span>
      <span className="ws-stat__lv ws-numeral">
        <small>Lv.</small>
        {level}
      </span>
      <div className="ws-stat__track" role="progressbar" aria-label={`${STAT_NAMES[stat]} progress`} aria-valuenow={width} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={`ws-stat__fill${width <= 0 ? ' ws-stat__fill--zero' : ''}`}
          style={{ width: `${width}%`, transition: animate ? undefined : 'none' }}
        />
      </div>
      {note && <p className="judgement__note">{note}</p>}
    </div>
  )
}
