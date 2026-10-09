import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { computeSkills, isWeakening, numeral, skillEvents, skillFromDays, skillName } from './skills.js'
import { dayKeys, entry, freezeTime, newestFirst, unfreezeTime } from '../test/helpers.js'

// A skill's state after the activity was done on `days`, viewed on day `today`
// (days counted from 1 September 2026).
const skill = (days, today) => skillFromDays(dayKeys(days), dayKeys([today])[0])
const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i)

describe('unlocking', () => {
  it('needs 5 days in a row', () => {
    expect(skill(range(0, 3), 3)).toMatchObject({ rank: 0, unlocked: false, progress: 4 })
    expect(skill(range(0, 4), 4)).toMatchObject({ rank: 1, unlocked: true })
  })

  it('allows a single rest day', () => {
    expect(skill([0, 1, 3, 4, 5], 5).rank).toBe(1)
  })

  it('breaks the run after two missed days', () => {
    expect(skill([0, 1, 4, 5, 6], 6)).toMatchObject({ rank: 0, progress: 3 })
  })
})

describe('ranks', () => {
  it('rises one rank per further 5-day run', () => {
    expect(skill(range(0, 9), 9).rank).toBe(2)
  })

  it('stops at Rank V', () => {
    expect(skill(range(0, 29), 29).rank).toBe(5)
  })
})

describe('demotion and Lost', () => {
  it('counts down to the next demotion', () => {
    // Last done on day 4: days 5-10 are missed, so day 11 is the last before demotion.
    expect(skill(range(0, 4), 10)).toMatchObject({ rank: 1, daysUntilDemotion: 2 })
    expect(skill(range(0, 4), 11)).toMatchObject({ rank: 1, daysUntilDemotion: 1 })
  })

  it('becomes Lost after a week without the activity at Rank I', () => {
    expect(skill(range(0, 4), 12)).toMatchObject({ rank: 0, unlocked: true, lost: true, daysUntilDemotion: null })
  })

  it('drops one rank per week from higher ranks', () => {
    expect(skill(range(0, 9), 17).rank).toBe(1)
  })

  it('is restored by another 5-day run', () => {
    const restored = skill([...range(0, 4), ...range(20, 24)], 24)
    expect(restored).toMatchObject({ rank: 1, lost: false, everRestored: true })
    expect(skill(range(0, 9), 9).everRestored).toBe(false)
  })
})

describe('computeSkills and events', () => {
  beforeEach(freezeTime)
  afterEach(unfreezeTime)

  const run = (tag, days) => days.map((n) => entry(n, { tags: [tag] }))

  it('tracks each activity separately', () => {
    const skills = computeSkills(newestFirst([...run('running', range(0, 4)), ...run('reading', [0, 1])]))
    expect(skills.running.rank).toBe(1)
    expect(skills.reading).toMatchObject({ rank: 0, progress: 2 })
  })

  it('reports acquired, ranked and restored skills', () => {
    const before = { a: { rank: 0, unlocked: false }, b: { rank: 1, unlocked: true, lost: false }, c: { rank: 0, unlocked: true, lost: true } }
    const after = { a: { rank: 1 }, b: { rank: 2 }, c: { rank: 1 }, d: { rank: 0 } }
    expect(skillEvents(before, after)).toEqual([
      { tag: 'a', kind: 'acquired', from: 0, to: 1 },
      { tag: 'b', kind: 'ranked', from: 1, to: 2 },
      { tag: 'c', kind: 'restored', from: 0, to: 1 },
    ])
  })

  it('warns when a demotion is within 3 days and the deed was not done today', () => {
    expect(isWeakening({ daysUntilDemotion: 3, doneToday: false })).toBe(true)
    expect(isWeakening({ daysUntilDemotion: 4, doneToday: false })).toBe(false)
    expect(isWeakening({ daysUntilDemotion: 1, doneToday: true })).toBe(false)
    expect(isWeakening({ daysUntilDemotion: null, doneToday: false })).toBe(false)
  })
})

describe('names', () => {
  it('uses the System name, or the activity in title case', () => {
    expect(skillName('running', { running: { name: 'Iron Lungs' } })).toBe('Iron Lungs')
    expect(skillName('weight lifting', {})).toBe('Weight Lifting')
  })

  it('writes ranks as numerals', () => {
    expect([1, 2, 3, 4, 5].map(numeral)).toEqual(['I', 'II', 'III', 'IV', 'V'])
  })
})
