// Stat totals are never stored. They are always calculated from the entries,
// so changing the rules later automatically applies to all past entries.

// Max points a single stat can gain in one day (stops entry-spamming).
export const DAILY_CAP = 1.5

// An entry counts toward a streak if Body or Mind gained at least this much.
const MEANINGFUL_GAIN = 0.2

// Will +1 for every this-many consecutive meaningful days.
const DAYS_PER_WILL = 3

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

function sumWithDailyCap(entries, stat) {
  const perDay = {}
  for (const e of entries) {
    const key = dayKey(e.createdAt)
    perDay[key] = (perDay[key] ?? 0) + e[stat]
  }
  return Object.values(perDay).reduce((sum, v) => sum + Math.min(v, DAILY_CAP), 0)
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

export function computeStats(entries) {
  const { runs, lastDay } = streakRuns(entries)
  const will = runs.reduce((sum, len) => sum + Math.floor(len / DAYS_PER_WILL), 0)

  // The current streak is only alive if the last meaningful day was today or yesterday.
  const today = dayKey(new Date().toISOString())
  const yesterday = dayKey(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
  const alive = lastDay === today || lastDay === yesterday
  const currentStreak = alive ? runs[runs.length - 1] : 0

  return {
    body: round1(sumWithDailyCap(entries, 'body')),
    mind: round1(sumWithDailyCap(entries, 'mind')),
    will,
    currentStreak,
    daysToNextWill: DAYS_PER_WILL - (currentStreak % DAYS_PER_WILL),
  }
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
