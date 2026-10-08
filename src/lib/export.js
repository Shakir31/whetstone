// Turns the journal into a plain text file the person can keep.

import { entriesByDay } from './stats.js'
import { gainsOf, longDate, time } from './format.js'

// The whole journal as readable text, oldest day first.
export function journalText(entries, { email, classDay = null }) {
  const days = entriesByDay(entries, classDay).reverse()
  const lines = [
    'WHETSTONE',
    `Journal of ${email}`,
    `Exported ${longDate(new Date())} ${new Date().getFullYear()}`,
    `${entries.length} entries`,
    '',
  ]
  for (const day of days) {
    const year = new Date(day.date).getFullYear()
    lines.push('', `=== ${longDate(day.date)} ${year} ===`, '')
    for (const entry of [...day.entries].reverse()) {
      const gains = gainsOf(entry).map((g) => `${g.stat} +${g.amount}`)
      lines.push(`${time(entry.createdAt)}${gains.length ? `  [${gains.join(', ')}]` : ''}`)
      lines.push(entry.text)
      if (entry.systemMessage) lines.push(`System: ${entry.systemMessage}`)
      lines.push('')
    }
  }
  return lines.join('\n')
}

// Starts a download of the journal in the browser.
export function downloadJournal(entries, options) {
  const blob = new Blob([journalText(entries, options)], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `whetstone-journal-${new Date().toISOString().slice(0, 10)}.txt`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
