// Weekly summaries cover calendar weeks, Monday to Sunday, in the person's own
// time zone. When a week has ended, the app asks the weekly-judgement Edge
// Function to write the System's judgement of it, once.

import { computeStats, dayKey } from './stats.js'
import { computeSkills, skillEvents, skillName } from './skills.js'
import { dayMonth } from './format.js'

const DAY_MS = 24 * 60 * 60 * 1000

// Midnight on the Monday of the week containing `date`.
export function weekStartOf(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}

// The "YYYY-MM-DD" of the Monday of the week containing `date`.
export function weekKeyOf(date) {
  return dayKey(weekStartOf(date))
}

// The most recent week that has fully ended: { key, start, end } (end is the next Monday).
export function lastCompletedWeek(now = new Date()) {
  const end = weekStartOf(now)
  const start = new Date(end)
  start.setDate(start.getDate() - 7)
  return { key: dayKey(start), start, end }
}

// "Week of 28 September"
export function weekLabel(weekKey) {
  const [y, m, d] = weekKey.split('-').map(Number)
  return `Week of ${dayMonth(new Date(y, m - 1, d))}`
}

const round1 = (n) => Math.round(n * 10) / 10

// The facts the System is given about one week, worked out from the record.
export function weekFacts(entries, week, { classDay = null, skillNames = {} } = {}) {
  const t = (e) => Date.parse(e.createdAt)
  const before = entries.filter((e) => t(e) < week.start.getTime())
  const upToEnd = entries.filter((e) => t(e) < week.end.getTime())
  const inWeek = upToEnd.filter((e) => t(e) >= week.start.getTime())

  const statsBefore = computeStats(before, classDay)
  const statsAfter = computeStats(upToEnd, classDay)

  // Activities done that week, most days first.
  const daysByTag = new Map()
  for (const e of inWeek) {
    for (const tag of e.tags ?? []) {
      if (!daysByTag.has(tag)) daysByTag.set(tag, new Set())
      daysByTag.get(tag).add(dayKey(e.createdAt))
    }
  }
  const activities = [...daysByTag]
    .sort((a, b) => b[1].size - a[1].size)
    .slice(0, 6)
    .map(([tag, days]) => ({ name: tag, days: days.size }))

  // Skills as they stood at the start and at the end of the week.
  const skillsBefore = computeSkills(before, new Date(week.start.getTime() - DAY_MS))
  const skillsAfter = computeSkills(upToEnd, new Date(week.end.getTime() - DAY_MS))
  const skillsGained = skillEvents(skillsBefore, skillsAfter).map((e) => skillName(e.tag, skillNames))
  const skillsWeakened = Object.values(skillsAfter)
    .filter((s) => s.rank < (skillsBefore[s.tag]?.rank ?? 0))
    .map((s) => skillName(s.tag, skillNames))

  return {
    daysRecorded: new Set(inWeek.map((e) => dayKey(e.createdAt))).size,
    entries: inWeek.length,
    body: round1(statsAfter.body - statsBefore.body),
    mind: round1(statsAfter.mind - statsBefore.mind),
    bodyLevel: [Math.floor(statsBefore.body), Math.floor(statsAfter.body)],
    mindLevel: [Math.floor(statsBefore.mind), Math.floor(statsAfter.mind)],
    willLevel: [statsBefore.will, statsAfter.will],
    activities,
    skillsGained,
    skillsWeakened,
  }
}
