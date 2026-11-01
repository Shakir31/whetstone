// Stat totals are never stored. They are always calculated from the entries,
// so changing the rules later automatically applies to all past entries.

// Max points a single stat can gain in one day (stops entry-spamming).
export const DAILY_CAP = 1.5
// The higher cap from the day a person receives their class onward.
export const CLASS_DAILY_CAP = 3

// The cap for a day. `classDay` is the "YYYY-MM-DD" the class was assigned, or null.
export function dailyCap(key, classDay) {
  return classDay && key >= classDay ? CLASS_DAILY_CAP : DAILY_CAP
}

// An entry counts toward a streak if Body or Mind gained at least this much.
export const MEANINGFUL_GAIN = 0.2

// Will +1 for every this-many consecutive meaningful days.
export const DAYS_PER_WILL = 3

// "2026-10-02" in the user's local time zone.
export function dayKey(isoDate) {
  const d = new Date(isoDate)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

function round1(n) {
  return Math.round(n * 10) / 10
}

function sumWithDailyCap(entries, stat, classDay) {
  const perDay = {}
  for (const e of entries) {
    const key = dayKey(e.createdAt)
    perDay[key] = (perDay[key] ?? 0) + e[stat]
  }
  return Object.entries(perDay).reduce((sum, [key, v]) => sum + Math.min(v, dailyCap(key, classDay)), 0)
}

// Lengths of each run of consecutive meaningful days, oldest first.
function streakRuns(entries) {
  const days = new Set(
    entries
      .filter((e) => e.body >= MEANINGFUL_GAIN || e.mind >= MEANINGFUL_GAIN)
      .map((e) => dayKey(e.createdAt)),
  )
  const sorted = [...days].sort()

  const runs = []
  let prev = null
  for (const key of sorted) {
    const isNextDay = prev && new Date(key) - new Date(prev) === 24 * 60 * 60 * 1000
    if (isNextDay) runs[runs.length - 1]++
    else runs.push(1)
    prev = key
  }
  return { runs, lastDay: prev }
}

export function computeStats(entries, classDay = null) {
  const { runs, lastDay } = streakRuns(entries)
  const will = runs.reduce((sum, len) => sum + Math.floor(len / DAYS_PER_WILL), 0)

  // The current streak is only alive if the last meaningful day was today or yesterday.
  const today = dayKey(new Date().toISOString())
  const yesterday = dayKey(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
  const alive = lastDay === today || lastDay === yesterday
  const currentStreak = alive ? runs[runs.length - 1] : 0

  return {
    body: round1(sumWithDailyCap(entries, 'body', classDay)),
    mind: round1(sumWithDailyCap(entries, 'mind', classDay)),
    will,
    currentStreak,
    longestStreak: runs.length ? Math.max(...runs) : 0,
    daysToNextWill: DAYS_PER_WILL - (currentStreak % DAYS_PER_WILL),
    // How many of the days in the current Will cycle are done (for the streak pips).
    willCycleDone: currentStreak % DAYS_PER_WILL,
    willCycleLength: DAYS_PER_WILL,
  }
}

// Groups entries (newest first) into days, newest first, with each day's
// totals after the daily cap — the same amounts that count towards the stats.
export function entriesByDay(entries, classDay = null) {
  const days = []
  for (const entry of entries) {
    const key = dayKey(entry.createdAt)
    let day = days[days.length - 1]
    if (!day || day.key !== key) {
      day = { key, date: entry.createdAt, entries: [], body: 0, mind: 0 }
      days.push(day)
    }
    day.entries.push(entry)
    day.body += entry.body
    day.mind += entry.mind
  }
  for (const day of days) {
    day.body = round1(Math.min(day.body, dailyCap(day.key, classDay)))
    day.mind = round1(Math.min(day.mind, dailyCap(day.key, classDay)))
  }
  return days
}

// Display only: 7.4 Body is shown as Lv. 7 with 40% progress to Lv. 8.
// Will is already a whole number; its progress is how far along the current
// streak is towards the next point.
export function statLevels(stats) {
  const split = (raw) => {
    const value = round1(raw)
    const level = Math.floor(value)
    return { level, progress: Math.round((value - level) * 100) }
  }
  return {
    body: split(stats.body),
    mind: split(stats.mind),
    will: {
      level: stats.will,
      progress: Math.round(((stats.currentStreak % DAYS_PER_WILL) / DAYS_PER_WILL) * 100),
    },
  }
}
