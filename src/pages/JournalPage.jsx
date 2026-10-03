import { useCallback, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import StatsStrip from '../components/StatsStrip.jsx'
import EntryForm from '../components/EntryForm.jsx'
import RecentEntries from '../components/RecentEntries.jsx'
import JudgementOverlay from '../components/JudgementOverlay.jsx'
import { submitEntry } from '../lib/entries.js'
import { computeStats } from '../lib/stats.js'
import { longDate } from '../lib/format.js'

// Let the System "read" for at least this long so the moment has weight.
const MIN_JUDGING_MS = 1800

export default function JournalPage() {
  const { entries, stats, addEntry, loadError } = useOutletContext()
  const [result, setResult] = useState(null) // null | { entry, before, after }

  // Errors are thrown on to EntryForm, which shows the message.
  async function handleSubmit(text) {
    const [entry] = await Promise.all([
      submitEntry(text),
      new Promise((resolve) => setTimeout(resolve, MIN_JUDGING_MS)),
    ])
    const after = computeStats([entry, ...entries])
    addEntry(entry)
    setResult({ entry, before: stats, after })
  }

  const closeResult = useCallback(() => setResult(null), [])

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

      {result && <JudgementOverlay {...result} onClose={closeResult} />}
    </main>
  )
}
