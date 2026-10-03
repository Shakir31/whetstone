import { useCallback, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import StatsStrip from '../components/StatsStrip.jsx'
import EntryForm from '../components/EntryForm.jsx'
import RecentEntries from '../components/RecentEntries.jsx'
import JudgementOverlay from '../components/JudgementOverlay.jsx'
import { submitEntry } from '../lib/entries.js'
import { computeStats } from '../lib/stats.js'
import { longDate } from '../lib/format.js'

// Keep the "judging" screen up at least this long so the moment has weight.
const MIN_JUDGING_MS = 1500

export default function JournalPage() {
  const { entries, stats, addEntry, loadError } = useOutletContext()
  const [overlay, setOverlay] = useState(null) // null | { result: null | { entry, before, after } }

  async function handleSubmit(text) {
    setOverlay({ result: null })
    try {
      const [entry] = await Promise.all([
        submitEntry(text),
        new Promise((resolve) => setTimeout(resolve, MIN_JUDGING_MS)),
      ])
      const after = computeStats([entry, ...entries])
      addEntry(entry)
      setOverlay({ result: { entry, before: stats, after } })
    } catch (err) {
      setOverlay(null)
      throw err // EntryForm shows the message
    }
  }

  const closeOverlay = useCallback(() => setOverlay(null), [])

  return (
    <main className="page page--journal">
      <StatsStrip stats={stats} />

      <section aria-labelledby="today-title" className="today">
        <div className="page-head">
          <span className="ws-micro page-head__eyebrow">{longDate(new Date())}</span>
          <h1 id="today-title" className="ws-title">
            Today's deeds
          </h1>
        </div>
        <EntryForm onSubmit={handleSubmit} />
      </section>

      {loadError && <p className="form-error">{loadError}</p>}
      <RecentEntries entries={entries} />

      {overlay && <JudgementOverlay result={overlay.result} onClose={closeOverlay} />}
    </main>
  )
}
