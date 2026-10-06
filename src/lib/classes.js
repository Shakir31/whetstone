// Classes: assigned at Will Lv. 5 from the path a person follows most, ranked
// up by path days, evolved at Rank III. The class itself is stored (assigned
// and evolved by the score-entry Edge Function); rank and hints are worked out
// here from the entries. Keep the rules in sync with the Edge Function.

import { dayKey } from './stats.js'

export const WILL_FOR_CLASS = 5
export const DAYS_PER_CLASS_RANK = 15
export const MAX_CLASS_RANK = 5
export const EVOLVE_AT_RANK = 3

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

// The class's display name: the evolved name once it has evolved.
export function className(playerClass) {
  return playerClass.evolvedName ?? CLASSES[playerClass.baseClass].name
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
  const rankBefore = classProgress(was, before.entries, before.paths).rank
  const rankAfter = classProgress(now, after.entries, after.paths).rank
  if (rankAfter > rankBefore) return { kind: 'ranked', name: className(now), from: rankBefore, to: rankAfter }
  return null
}
