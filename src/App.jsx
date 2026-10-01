import { useEffect, useMemo, useState } from 'react'
import EntryForm from './components/EntryForm.jsx'
import StatsPanel from './components/StatsPanel.jsx'
import SystemMessage from './components/SystemMessage.jsx'
import EntryList from './components/EntryList.jsx'
import { scoreEntry } from './lib/scoring.js'
import { computeStats } from './lib/stats.js'
import { loadEntries, saveEntries } from './lib/storage.js'

export default function App() {
  const [entries, setEntries] = useState(loadEntries)
  const [latestMessage, setLatestMessage] = useState(null)

  useEffect(() => saveEntries(entries), [entries])

  const stats = useMemo(() => computeStats(entries), [entries])

  async function handleSubmit(text) {
    const result = await scoreEntry(text)
    const entry = {
      id: crypto.randomUUID(),
      text,
      createdAt: new Date().toISOString(),
      ...result,
    }
    setEntries((prev) => [entry, ...prev])
    setLatestMessage(result.systemMessage)
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>Soul Journal</h1>
        <p className="subtitle">Record your deeds. The System will judge them.</p>
      </header>

      <StatsPanel stats={stats} />
      <EntryForm onSubmit={handleSubmit} />
      {latestMessage && (
        <SystemMessage message={latestMessage} onDismiss={() => setLatestMessage(null)} />
      )}
      <EntryList entries={entries} />
    </main>
  )
}
