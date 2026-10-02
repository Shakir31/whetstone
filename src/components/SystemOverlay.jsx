import { useEffect, useState } from 'react'
import { statLevels } from '../lib/stats.js'

// Timing of the reveal, in milliseconds.
const ROWS_START = 1800 // after the message has faded in
const ROW_STAGGER = 700
const BAR_FILL = 700 // keep in sync with .bar-fill transition in index.css
const CONTINUE_AFTER = 1200

// Full-screen overlay shown while an entry is judged, then the reveal.
// `result` is null while judging, or { entry, before, after } once scored.
export default function SystemOverlay({ result, onClose }) {
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-live="polite">
      {result ? <Reveal {...result} onClose={onClose} /> : <Judging />}
    </div>
  )
}

function Judging() {
  return <p className="overlay-judging">The System is judging your deeds…</p>
}

function Reveal({ entry, before, after, onClose }) {
  const rows = gainRows(entry, before, after)
  const continueAt = ROWS_START + rows.length * ROW_STAGGER + CONTINUE_AFTER
  const [canContinue, setCanContinue] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setCanContinue(true), continueAt)
    return () => clearTimeout(timer)
  }, [continueAt])

  useEffect(() => {
    if (!canContinue) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canContinue, onClose])

  return (
    <div className="overlay-reveal">
      <span className="system-label">[ SYSTEM ]</span>
      <p className="overlay-message">{entry.systemMessage}</p>

      <div className="overlay-gains">
        {rows.map((row, i) => (
          <GainRow key={row.name} {...row} delay={ROWS_START + i * ROW_STAGGER} />
        ))}
      </div>

      {canContinue && (
        <button type="button" className="primary overlay-continue" onClick={onClose} autoFocus>
          Continue
        </button>
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
      rows.push({ name: stat, from: from[stat], to: to[stat], amount: `+${gained}` })
    } else if (entry[stat] > 0) {
      // The AI awarded points but the daily cap absorbed them.
      rows.push({ name: stat, from: from[stat], to: to[stat], note: "The day's limit has been reached." })
    }
  }

  const willChanged =
    to.will.level !== from.will.level || to.will.progress !== from.will.progress
  if (willChanged) {
    rows.push({ name: 'will', from: from.will, to: to.will })
  }
  return rows
}

function GainRow({ name, from, to, amount, note, delay }) {
  const [level, setLevel] = useState(from.level)
  const [width, setWidth] = useState(from.progress)
  const [animate, setAnimate] = useState(true)
  const [leveledUp, setLeveledUp] = useState(false)

  useEffect(() => {
    const timers = []
    const at = (ms, fn) => timers.push(setTimeout(fn, ms))

    if (to.level > from.level) {
      // Fill to the end, then jump to the new level and fill to the new progress.
      at(delay + 200, () => setWidth(100))
      at(delay + 200 + BAR_FILL, () => {
        setAnimate(false)
        setLevel(to.level)
        setLeveledUp(true)
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
    <div className="gain-row" style={{ animationDelay: `${delay}ms` }}>
      <div className="gain-row-header">
        <span className="stat-name">{name}</span>
        <span className="gain-level">Lv. {level}</span>
        {amount && <span className="gain-amount">{amount}</span>}
      </div>
      <div className="bar">
        <div className={`bar-fill${animate ? '' : ' no-transition'}`} style={{ width: `${width}%` }} />
      </div>
      {leveledUp && <p className="level-up">{name.toUpperCase()} LEVEL UP</p>}
      {note && <p className="gain-note">{note}</p>}
    </div>
  )
}
