// Shared helpers for the tests. All dates are local, around a fixed "now", so
// the tests give the same result in any time zone and on any day.

import { vi } from 'vitest'

// Wednesday 7 October 2026, midday, local time.
export const NOW = new Date(2026, 9, 7, 12, 0, 0)

// Freezes the clock at NOW (only Date; timers keep working).
export function freezeTime() {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(NOW)
}

export function unfreezeTime() {
  vi.useRealTimers()
}

// An ISO timestamp `daysAgo` days before NOW, at `hour` o'clock local time.
export function daysAgo(n, hour = 12) {
  const d = new Date(NOW)
  d.setDate(d.getDate() - n)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

let nextId = 1

// A journal entry, newest-first order is up to the caller.
export function entry(n, { body = 0, mind = 0, tags = [], hour = 12, text = 'Sample.', systemMessage = 'Recorded.' } = {}) {
  return { id: String(nextId++), createdAt: daysAgo(n, hour), body, mind, tags, text, systemMessage }
}

// Entries sorted newest first, as the app keeps them.
export function newestFirst(entries) {
  return [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

// "YYYY-MM-DD" keys for a list of day numbers, counted from 1 September 2026.
export function dayKeys(numbers) {
  return numbers.map((n) => new Date(Date.UTC(2026, 8, 1 + n)).toISOString().slice(0, 10))
}
