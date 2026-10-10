// Skills are earned by repeating the same activity (an entry "tag") for days on
// end. Like the stats, ranks are never stored: they are worked out from the
// entries, so changing these rules applies to all past entries too.
// The unlock rule is also checked in the Edge Function; keep them in sync.

import { dayKey } from './stats.js'

export const RUN_FOR_RANK = 5 // days of the same activity in a row for each rank
export const REST_DAYS_ALLOWED = 1 // a single missed day doesn't break the run
// Physical training needs recovery, so its runs allow longer rests.
export const PHYSICAL_PATHS = ['strength', 'endurance']
export const PHYSICAL_REST_DAYS_ALLOWED = 2
export const MAX_RANK = 5
export const DEMOTE_AFTER_DAYS = 7 // each this many days without the activity costs a rank
export const WARN_WITHIN_DAYS = 3 // warn when a demotion is this close

const NUMERALS = ['', 'I', 'II', 'III', 'IV', 'V']

export function numeral(rank) {
  return NUMERALS[rank] ?? String(rank)
}

// Days between two "YYYY-MM-DD" keys.
function daysApart(a, b) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000)
}

// Rest days in a row an activity's run allows, from its path.
export function restDaysFor(path) {
  return PHYSICAL_PATHS.includes(path) ? PHYSICAL_REST_DAYS_ALLOWED : REST_DAYS_ALLOWED
}

// Plays through the days an activity was done (sorted "YYYY-MM-DD" keys):
// each unbroken run of RUN_FOR_RANK days raises the rank, each
// DEMOTE_AFTER_DAYS days without it lowers the rank. `restDays` is how many
// days in a row can be missed without breaking a run.
export function skillFromDays(days, today, restDays = REST_DAYS_ALLOWED) {
  let rank = 0
  let unlocked = false
  let run = 0
  let prev = null
  let everRestored = false

  for (const day of days) {
    if (prev) {
      const missed = daysApart(prev, day) - 1
      if (unlocked) rank = Math.max(0, rank - Math.floor(missed / DEMOTE_AFTER_DAYS))
      if (missed > restDays) run = 0
    }
    run += 1
    if (run === RUN_FOR_RANK) {
      run = 0
      if (unlocked && rank === 0) everRestored = true
      unlocked = true
      rank = Math.min(MAX_RANK, rank + 1)
    }
    prev = day
  }

  // Time has passed since the activity was last done. Today doesn't count as
  // missed until it is over.
  const missed = prev ? Math.max(0, daysApart(prev, today) - 1) : 0
  if (unlocked) rank = Math.max(0, rank - Math.floor(missed / DEMOTE_AFTER_DAYS))
  const runAlive = missed <= restDays

  return {
    rank,
    unlocked,
    lost: unlocked && rank === 0,
    // Days done in the current run towards the next rank (or towards restoring a lost skill).
    progress: runAlive ? run : 0,
    // Days left before the next demotion, or null if there is nothing to lose.
    daysUntilDemotion: unlocked && rank > 0 ? DEMOTE_AFTER_DAYS - (missed % DEMOTE_AFTER_DAYS) : null,
    doneToday: prev === today,
    // Has this skill ever been brought back from Lost?
    everRestored,
  }
}

// { [tag]: skill } for every activity in the entries. `paths` is
// { [activity]: path }, used for the rest days each activity allows.
export function computeSkills(entries, now = new Date(), paths = {}) {
  const daysByTag = new Map()
  for (const entry of entries) {
    for (const tag of entry.tags ?? []) {
      if (!daysByTag.has(tag)) daysByTag.set(tag, new Set())
      daysByTag.get(tag).add(dayKey(entry.createdAt))
    }
  }

  const today = dayKey(now)
  const skills = {}
  for (const [tag, days] of daysByTag) {
    skills[tag] = { tag, ...skillFromDays([...days].sort(), today, restDaysFor(paths[tag])) }
  }
  return skills
}

// Skills that will be demoted within WARN_WITHIN_DAYS unless done today.
export function isWeakening(skill) {
  return skill.daysUntilDemotion !== null && skill.daysUntilDemotion <= WARN_WITHIN_DAYS && !skill.doneToday
}

// "weight lifting" → "Weight Lifting"
export function titleCase(text) {
  return text.replace(/\b\w/g, (c) => c.toUpperCase())
}

// The System's name for a skill, or the activity's own name until it has one.
export function skillName(tag, names) {
  return names[tag]?.name ?? titleCase(tag)
}

// What changed for each activity between two computeSkills() results:
// a skill acquired, ranked up, or restored from Lost.
// `newlyNamed` lists activities the System named with this entry: a skill that
// unlocked earlier without a judgement (e.g. after a rule change) is announced
// when it gets its name.
export function skillEvents(before, after, newlyNamed = []) {
  const events = []
  for (const [tag, now] of Object.entries(after)) {
    const was = before[tag]
    if (now.rank <= (was?.rank ?? 0)) continue
    const kind = !was?.unlocked ? 'acquired' : was.lost ? 'restored' : 'ranked'
    events.push({ tag, kind, from: was?.rank ?? 0, to: now.rank })
  }
  for (const tag of newlyNamed) {
    const now = after[tag]
    if (now?.rank > 0 && !events.some((e) => e.tag === tag)) {
      events.push({ tag, kind: 'acquired', from: 0, to: now.rank })
    }
  }
  return events
}
