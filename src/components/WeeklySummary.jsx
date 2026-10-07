import { useState } from 'react'
import { Button, SystemMessage } from '../ui/whetstone.jsx'
import { weekLabel } from '../lib/weekly.js'

// "5 of 7 days recorded · Body +2.4 · Mind +1.1"
export function factsLine(facts) {
  const parts = [`${facts.daysRecorded ?? 0} of 7 days recorded`]
  if (facts.body > 0) parts.push(`Body +${facts.body}`)
  if (facts.mind > 0) parts.push(`Mind +${facts.mind}`)
  return parts.join(' · ')
}

// The System's judgement of a week. On the Journal it can be dismissed; the
// dismissal is remembered in this browser.
export default function WeeklySummary({ weekKey, summary, dismissible = false }) {
  const storageKey = 'whetstone.weekDismissed'
  const [dismissed, setDismissed] = useState(() => {
    try {
      return dismissible && localStorage.getItem(storageKey) === weekKey
    } catch {
      return false
    }
  })

  if (dismissed) return null

  function dismiss() {
    setDismissed(true)
    try {
      localStorage.setItem(storageKey, weekKey)
    } catch {
      // Storage unavailable — it will show again next visit.
    }
  }

  return (
    <SystemMessage kind="verdict" label="System · Weekly judgement" meta={weekLabel(weekKey)} className="weekly">
      <p className="weekly__summary">{summary.summary}</p>
      <div className="weekly__foot">
        <span className="ws-micro weekly__facts">{factsLine(summary.facts)}</span>
        {dismissible && (
          <Button variant="ghost" size="sm" onClick={dismiss}>
            Dismiss
          </Button>
        )}
      </div>
    </SystemMessage>
  )
}
