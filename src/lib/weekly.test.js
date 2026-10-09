import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { lastCompletedWeek, weekFacts, weekKeyOf, weekLabel, weekStartOf } from './weekly.js'
import { entry, freezeTime, newestFirst, unfreezeTime } from '../test/helpers.js'

beforeEach(freezeTime)
afterEach(unfreezeTime)

describe('weeks run Monday to Sunday', () => {
  it('starts each week on Monday at midnight', () => {
    expect(weekStartOf(new Date(2026, 9, 7, 15))).toEqual(new Date(2026, 9, 5, 0, 0, 0)) // Wednesday
    expect(weekKeyOf(new Date(2026, 9, 4, 23, 59))).toBe('2026-09-28') // Sunday
    expect(weekKeyOf(new Date(2026, 9, 5, 0, 1))).toBe('2026-10-05') // Monday
  })

  it('knows the last week that has ended', () => {
    const week = lastCompletedWeek() // now is Wednesday 7 October
    expect(week.key).toBe('2026-09-28')
    expect(week.start).toEqual(new Date(2026, 8, 28))
    expect(week.end).toEqual(new Date(2026, 9, 5))
  })

  it('labels a week by its Monday', () => {
    expect(weekLabel('2026-09-28')).toBe('Week of 28 September')
  })
})

describe('weekFacts', () => {
  it('summarises only the days inside the week', () => {
    // Now is Wednesday 7 Oct; last week is Mon 28 Sep (9 days ago) to Sun 4 Oct (3 days ago).
    const entries = newestFirst([
      entry(1, { body: 0.5, tags: ['running'] }), // this week: ignored
      entry(3, { body: 0.5, tags: ['running'] }),
      entry(4, { body: 0.5, tags: ['running'] }),
      entry(4, { mind: 0.4, tags: ['reading'] }),
      entry(9, { body: 0.5, tags: ['running'] }),
      entry(12, { body: 0.5 }), // the week before: ignored
    ])
    const facts = weekFacts(entries, lastCompletedWeek())
    expect(facts.daysRecorded).toBe(3)
    expect(facts.entries).toBe(4)
    expect(facts.body).toBe(1.5)
    expect(facts.mind).toBe(0.4)
    expect(facts.activities).toEqual([
      { name: 'running', days: 3 },
      { name: 'reading', days: 1 },
    ])
  })

  it('handles an empty week', () => {
    const facts = weekFacts([], lastCompletedWeek())
    expect(facts).toMatchObject({ daysRecorded: 0, entries: 0, body: 0, mind: 0, activities: [] })
  })
})
