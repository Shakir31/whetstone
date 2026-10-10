// Classes: assigned at Will Lv. 5 from the path a person follows most, ranked
// up by path days, evolved at Rank III, and given a final form at Rank V. The
// class itself is stored (assigned and evolved by the score-entry Edge
// Function); rank, readings and hints are worked out here from the entries.
// Keep the rules in sync with the Edge Function.

import { dayKey } from './stats.js'

export const WILL_FOR_CLASS = 5
export const DAYS_PER_CLASS_RANK = 15
export const MAX_CLASS_RANK = 5
export const EVOLVE_AT_RANK = 3
export const FINAL_AT_RANK = 5

// The final form reads the record since the first evolution.
// What was done: the class path "deepened" if it was followed at least this
// many times as often as any other path.
export const DEEPENED_RATIO = 2
// A Hunter "deepened" if no single path took this share or more of its days.
export const HUNTER_BALANCED_SHARE = 0.4
// How steadily: the rhythm needs this many days before it can be read.
export const RHYTHM_MIN_DAYS = 7
export const STEADFAST = { coverage: 0.8, maxGap: 2 }
export const MEASURED = { coverage: 0.5, maxGap: 3 }
export const RESTLESS = { longestRun: 7, minGap: 5 }

export const PATHS = ['strength', 'endurance', 'knowledge', 'craft', 'discipline']

export const PATH_NAMES = {
  strength: 'Strength',
  endurance: 'Endurance',
  knowledge: 'Knowledge',
  craft: 'Craft',
  discipline: 'Discipline',
}

// How the System speaks of each path in hints: "leans toward the long road".
const PATH_PHRASES = {
  strength: 'the weight of iron',
  endurance: 'the long road',
  knowledge: 'the written word',
  craft: 'the work of the hands',
  discipline: 'cold restraint',
}

export const CLASSES = {
  ironclad: { name: 'Ironclad', path: 'strength', description: 'Bound to force. Grows by strength.' },
  wayfarer: { name: 'Wayfarer', path: 'endurance', description: 'Bound to distance. Grows by endurance.' },
  scholar: { name: 'Scholar', path: 'knowledge', description: 'Bound to learning. Grows by knowledge.' },
  artisan: { name: 'Artisan', path: 'craft', description: 'Bound to making. Grows by craft.' },
  ascetic: { name: 'Ascetic', path: 'discipline', description: 'Bound to restraint. Grows by discipline.' },
  hunter: { name: 'Hunter', path: null, description: 'Bound to no single path. Grows by every deed.' },
}

// Database row → app shape.
export function classFromRow(row) {
  if (!row) return null
  return {
    baseClass: row.base_class,
    title: row.title,
    assignedAt: row.assigned_at,
    evolvedName: row.evolved_name,
    evolvedDescription: row.evolved_description,
    evolvedPath: row.evolved_path,
    evolvedAt: row.evolved_at,
    finalName: row.final_name ?? null,
    finalDescription: row.final_description ?? null,
    finalOutcome: row.final_outcome ?? null,
    finalTemperament: row.final_temperament ?? null,
    finalPath: row.final_path ?? null,
    finalAt: row.final_at ?? null,
  }
}

// "YYYY-MM-DD" the class was assigned, or null (used for the higher daily cap).
export function classDayOf(playerClass) {
  return playerClass ? dayKey(playerClass.assignedAt) : null
}

// Rank and leanings of a class, from the entries since it was assigned.
// `paths` is { [activity]: path }.
export function classProgress(playerClass, entries, paths) {
  const fromDay = classDayOf(playerClass)
  const ownPath = CLASSES[playerClass.baseClass].path

  const daysByPath = Object.fromEntries(PATHS.map((p) => [p, new Set()]))
  for (const entry of entries) {
    const key = dayKey(entry.createdAt)
    if (key < fromDay) continue
    for (const tag of entry.tags ?? []) {
      if (paths[tag]) daysByPath[paths[tag]].add(key)
    }
  }

  // Path days: days with an activity from the class's path (any path for a Hunter).
  const pathDays = ownPath ? daysByPath[ownPath].size : new Set(PATHS.flatMap((p) => [...daysByPath[p]])).size
  const rank = Math.min(MAX_CLASS_RANK, 1 + Math.floor(pathDays / DAYS_PER_CLASS_RANK))

  // The second path followed most since assignment: what the class leans toward.
  const others = PATHS.filter((p) => p !== ownPath && daysByPath[p].size > 0)
  const leaning = others.length
    ? others.reduce((best, p) => (daysByPath[p].size > daysByPath[best].size ? p : best))
    : null

  return {
    rank,
    pathDays,
    daysToNextRank: rank >= MAX_CLASS_RANK ? 0 : DAYS_PER_CLASS_RANK - (pathDays % DAYS_PER_CLASS_RANK),
    progress: rank >= MAX_CLASS_RANK ? 100 : Math.round(((pathDays % DAYS_PER_CLASS_RANK) / DAYS_PER_CLASS_RANK) * 100),
    leaning,
  }
}

// The System's hint about what the class will become. Vague at Rank I,
// names the leaning from Rank II.
export function evolutionHint(rank, leaning) {
  if (rank < 2) return 'The form is not yet set.'
  if (!leaning) return 'The form hardens along its own path.'
  return `The form leans toward ${PATH_PHRASES[leaning]}.`
}

// ---------- The final form ----------

function daysApart(a, b) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000)
}

// How steadily the path was kept, from the days with any entry between
// `fromDay` and `today` ("YYYY-MM-DD"). Returns the measurements and a
// temperament, or a null temperament if there are too few days to tell.
export function readRhythm(recordedDays, fromDay, today) {
  const total = daysApart(fromDay, today) + 1
  const days = [...recordedDays].filter((d) => d >= fromDay && d <= today).sort()
  const coverage = total > 0 ? days.length / total : 0

  // Gaps: runs of days with nothing recorded, including any since the last entry.
  let maxGap = 0
  let longestRun = 0
  let run = 0
  let prev = null
  for (const day of days) {
    const gap = prev ? daysApart(prev, day) - 1 : daysApart(fromDay, day)
    maxGap = Math.max(maxGap, gap)
    run = prev && gap === 0 ? run + 1 : 1
    longestRun = Math.max(longestRun, run)
    prev = day
  }
  // Since the last entry; today doesn't count as missed until it is over.
  maxGap = Math.max(maxGap, prev ? Math.max(0, daysApart(prev, today) - 1) : total)

  let temperament = null
  if (total >= RHYTHM_MIN_DAYS) {
    if (coverage >= STEADFAST.coverage && maxGap <= STEADFAST.maxGap) temperament = 'steadfast'
    else if (coverage >= MEASURED.coverage && maxGap <= MEASURED.maxGap) temperament = 'measured'
    else if (longestRun >= RESTLESS.longestRun && maxGap >= RESTLESS.minGap) temperament = 'restless'
    else temperament = 'wavering'
  }
  return { total, recorded: days.length, coverage, maxGap, longestRun, temperament }
}

// What was done since the first evolution: whether the class path deepened,
// the second path stayed bound to it, or the class turned toward a new path.
export function readOutcome(playerClass, daysByPath) {
  const ownPath = CLASSES[playerClass.baseClass].path
  const size = (p) => daysByPath[p]?.size ?? 0
  const top = (candidates) =>
    candidates.filter((p) => size(p) > 0).reduce((best, p) => (best === null || size(p) > size(best) ? p : best), null)

  if (!ownPath) {
    // A Hunter follows every path: it deepens by staying balanced.
    const total = PATHS.reduce((sum, p) => sum + size(p), 0)
    const leader = top(PATHS)
    if (!leader || size(leader) / total < HUNTER_BALANCED_SHARE) return { outcome: 'deepened', newPath: null }
    if (leader === playerClass.evolvedPath) return { outcome: 'bound', newPath: null }
    return { outcome: 'turned', newPath: leader }
  }

  const second = top(PATHS.filter((p) => p !== ownPath))
  if (!second || size(ownPath) >= DEEPENED_RATIO * size(second)) return { outcome: 'deepened', newPath: null }
  if (second === playerClass.evolvedPath) return { outcome: 'bound', newPath: null }
  return { outcome: 'turned', newPath: second }
}

// Reads the record since the first evolution for the final form, or null
// before the first evolution.
export function readFinalForm(playerClass, entries, paths, now = new Date()) {
  if (!playerClass?.evolvedAt) return null
  const fromDay = dayKey(playerClass.evolvedAt)
  const today = dayKey(now)

  const daysByPath = Object.fromEntries(PATHS.map((p) => [p, new Set()]))
  const recorded = new Set()
  for (const entry of entries) {
    const key = dayKey(entry.createdAt)
    if (key < fromDay || key > today) continue
    recorded.add(key)
    for (const tag of entry.tags ?? []) {
      if (paths[tag]) daysByPath[paths[tag]].add(key)
    }
  }
  return { ...readOutcome(playerClass, daysByPath), ...readRhythm(recorded, fromDay, today) }
}

const TEMPERAMENT_HINTS = {
  steadfast: 'So far, the path is kept without fail.',
  measured: 'So far, the path is kept with steady rest.',
  restless: 'So far, the path is kept in bursts, with long silences between.',
  wavering: 'So far, the path is walked unevenly.',
}

function capitalise(text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// The two hints about the final form: what is shaping it, and how steadily.
export function finalFormHints(playerClass, reading) {
  let pathHint
  if (reading.outcome === 'deepened') {
    pathHint = CLASSES[playerClass.baseClass].path ? 'The path deepens.' : 'The form stays unbound.'
  } else if (reading.outcome === 'bound') {
    pathHint = playerClass.evolvedPath
      ? `${capitalise(PATH_PHRASES[playerClass.evolvedPath])} still holds the form.`
      : 'The path deepens.'
  } else {
    pathHint = `Something new pulls at the form: ${PATH_PHRASES[reading.newPath]}.`
  }
  const rhythmHint = reading.temperament
    ? TEMPERAMENT_HINTS[reading.temperament]
    : 'The System is watching how you keep to the path.'
  return [pathHint, rhythmHint]
}

// The class's display name: its latest form.
export function className(playerClass) {
  return playerClass.finalName ?? playerClass.evolvedName ?? CLASSES[playerClass.baseClass].name
}

// What happened to the class with one new entry: assigned, evolved or ranked
// up — or null. `before` and `after` are { playerClass, entries, paths }.
export function classEvent(before, after) {
  const was = before.playerClass
  const now = after.playerClass
  if (!now) return null
  if (!was) return { kind: 'assigned', name: className(now), title: now.title, to: 1 }
  if (!was.evolvedName && now.evolvedName) {
    return { kind: 'evolved', from: CLASSES[now.baseClass].name, name: now.evolvedName, description: now.evolvedDescription }
  }
  if (!was.finalName && now.finalName) {
    return {
      kind: 'evolved',
      from: was.evolvedName ?? CLASSES[now.baseClass].name,
      name: now.finalName,
      description: now.finalDescription,
    }
  }
  const rankBefore = classProgress(was, before.entries, before.paths).rank
  const rankAfter = classProgress(now, after.entries, after.paths).rank
  if (rankAfter > rankBefore) return { kind: 'ranked', name: className(now), from: rankBefore, to: rankAfter }
  return null
}
