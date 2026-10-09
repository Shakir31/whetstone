import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { CLASS_DAILY_CAP, DAILY_CAP, computeStats, dailyCap, dayKey, entriesByDay, statLevels } from './stats.js'
import { daysAgo, entry, freezeTime, newestFirst, unfreezeTime } from '../test/helpers.js'

beforeEach(freezeTime)
afterEach(unfreezeTime)

describe('dayKey', () => {
  it('uses the local calendar day', () => {
    expect(dayKey(new Date(2026, 9, 7, 23, 59))).toBe('2026-10-07')
    expect(dayKey(new Date(2026, 9, 8, 0, 1))).toBe('2026-10-08')
  })
})

describe('daily cap', () => {
  it('limits Body and Mind to 1.5 per day', () => {
    const stats = computeStats([entry(0, { body: 1, mind: 1 }), entry(0, { body: 1, mind: 0.2 })])
    expect(stats.body).toBe(DAILY_CAP)
    expect(stats.mind).toBe(1.2)
  })

  it('counts each day separately', () => {
    const stats = computeStats([entry(0, { body: 1 }), entry(1, { body: 1 }), entry(1, { body: 1 })])
    expect(stats.body).toBe(1 + DAILY_CAP)
  })

  it('rises to 3 from the day the class was assigned, and only from then', () => {
    const classDay = dayKey(daysAgo(1))
    expect(dailyCap(dayKey(daysAgo(2)), classDay)).toBe(DAILY_CAP)
    expect(dailyCap(dayKey(daysAgo(1)), classDay)).toBe(CLASS_DAILY_CAP)
    expect(dailyCap(dayKey(daysAgo(0)), classDay)).toBe(CLASS_DAILY_CAP)

    const entries = [2, 1].flatMap((n) => [entry(n, { body: 1 }), entry(n, { body: 1 }), entry(n, { body: 1 })])
    expect(computeStats(entries, classDay).body).toBe(DAILY_CAP + CLASS_DAILY_CAP)
  })
})

describe('Will and streaks', () => {
  const meaningfulDays = (days) => newestFirst(days.map((n) => entry(n, { body: 0.5 })))

  it('gives +1 Will for every 3 days in a row', () => {
    expect(computeStats(meaningfulDays([0, 1])).will).toBe(0)
    expect(computeStats(meaningfulDays([0, 1, 2])).will).toBe(1)
    expect(computeStats(meaningfulDays([0, 1, 2, 3, 4, 5, 6])).will).toBe(2)
  })

  it('keeps Will from earlier runs when a streak breaks', () => {
    // Days 10-12 earn 1 Will; days 0-2 earn another.
    expect(computeStats(meaningfulDays([0, 1, 2, 10, 11, 12])).will).toBe(2)
  })

  it('ignores entries below the meaningful gain', () => {
    const entries = [0, 1, 2].map((n) => entry(n, { body: 0.1, mind: 0.1 }))
    expect(computeStats(entries).will).toBe(0)
  })

  it('keeps the current streak alive until the end of today', () => {
    expect(computeStats(meaningfulDays([1, 2, 3])).currentStreak).toBe(3) // last entry yesterday
    expect(computeStats(meaningfulDays([2, 3, 4])).currentStreak).toBe(0) // missed yesterday
  })

  it('reports the longest streak and the progress to the next Will', () => {
    const stats = computeStats(meaningfulDays([0, 1, 5, 6, 7, 8]))
    expect(stats.longestStreak).toBe(4)
    expect(stats.currentStreak).toBe(2)
    expect(stats.daysToNextWill).toBe(1)
  })
})

describe('statLevels', () => {
  it('shows 7.4 as Lv. 7 at 40%', () => {
    expect(statLevels({ body: 7.4, mind: 0, will: 0, currentStreak: 0 }).body).toEqual({ level: 7, progress: 40 })
  })

  it('rounds away floating-point noise', () => {
    expect(statLevels({ body: 2.9999999, mind: 0, will: 0, currentStreak: 0 }).body).toEqual({ level: 3, progress: 0 })
  })

  it('shows Will progress as the share of the current 3-day cycle', () => {
    expect(statLevels({ body: 0, mind: 0, will: 2, currentStreak: 4 }).will).toEqual({ level: 2, progress: 33 })
  })
})

describe('entriesByDay', () => {
  it('groups newest first, with capped day totals', () => {
    const days = entriesByDay(newestFirst([entry(0, { body: 1 }), entry(0, { body: 1 }), entry(2, { mind: 0.4 })]))
    expect(days).toHaveLength(2)
    expect(days[0]).toMatchObject({ body: DAILY_CAP, mind: 0 })
    expect(days[0].entries).toHaveLength(2)
    expect(days[1]).toMatchObject({ body: 0, mind: 0.4 })
  })
})
