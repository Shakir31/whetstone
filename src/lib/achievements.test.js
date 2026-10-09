import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ACHIEVEMENTS, availableTitles, earnedKeys } from './achievements.js'
import { computeStats, dayKey } from './stats.js'
import { computeSkills } from './skills.js'
import { daysAgo, entry, freezeTime, newestFirst, unfreezeTime } from '../test/helpers.js'

beforeEach(freezeTime)
afterEach(unfreezeTime)

function earned(entries, { playerClass = null, classDay = null } = {}) {
  const sorted = newestFirst(entries)
  return earnedKeys({
    entries: sorted,
    stats: computeStats(sorted, classDay),
    skills: computeSkills(sorted),
    playerClass,
    classDay,
  })
}

describe('achievements', () => {
  it('have unique keys', () => {
    const keys = ACHIEVEMENTS.map((a) => a.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('earns nothing with no entries', () => {
    expect(earned([])).toEqual([])
  })

  it('marks the first entry', () => {
    expect(earned([entry(0, { body: 0.5 })])).toEqual(['first-entry'])
  })

  it('marks a 7-day streak and a first skill', () => {
    const week = Array.from({ length: 7 }, (_, n) => entry(n, { body: 0.5, tags: ['running'] }))
    expect(earned(week)).toEqual(expect.arrayContaining(['streak-7', 'skill-first']))
  })

  it('finds the secret deeds', () => {
    expect(earned([entry(0, { body: 0.5, hour: 4 })])).toContain('before-the-bell')
    expect(earned([entry(0)])).toContain('idle-hands') // no gains at all
    expect(earned([entry(0, { body: 1 }), entry(0, { body: 1 })])).toContain('at-the-limit')
  })

  it('uses the class limit for "At the Limit" once a class is held', () => {
    const classDay = dayKey(daysAgo(0))
    const day = [entry(0, { body: 1 }), entry(0, { body: 1 })] // 2, under the class limit of 3
    expect(earned(day, { classDay, playerClass: { assignedAt: daysAgo(0) } })).not.toContain('at-the-limit')
  })

  it('marks a class and its evolution', () => {
    expect(earned([entry(0, { body: 0.5 })], { playerClass: { evolvedName: null } })).toContain('class-assigned')
    expect(earned([entry(0, { body: 0.5 })], { playerClass: { evolvedName: 'Iron Reader' } })).toContain('class-evolved')
  })

  it('offers titles only from earned achievements', () => {
    expect(availableTitles({ 'streak-7': '2026-10-01', 'first-entry': '2026-09-01' })).toEqual(['the Unbroken'])
  })
})
