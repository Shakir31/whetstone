import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { dayMonth, gainsOf, longDate, numberWord, plural, shortDay, time } from './format.js'
import { journalText } from './export.js'
import { daysAgo, entry, freezeTime, newestFirst, unfreezeTime } from '../test/helpers.js'

beforeEach(freezeTime)
afterEach(unfreezeTime)

describe('dates', () => {
  it('formats dates the way the designs show them', () => {
    const d = new Date(2026, 9, 3, 6, 5)
    expect(longDate(d)).toBe('Saturday, 3 October')
    expect(dayMonth(d)).toBe('3 October')
    expect(time(d)).toBe('06:05')
  })

  it('says Today and Yesterday, then short dates with three-letter months', () => {
    expect(shortDay(daysAgo(0))).toBe('Today')
    expect(shortDay(daysAgo(1))).toBe('Yesterday')
    expect(shortDay(new Date(2026, 8, 30))).toBe('Wed 30 Sep')
  })
})

describe('words', () => {
  it('pluralises', () => {
    expect(plural(1, 'day')).toBe('1 day')
    expect(plural(3, 'day')).toBe('3 days')
    expect(plural(2, 'entry', 'entries')).toBe('2 entries')
  })

  it('writes small numbers as words', () => {
    expect(numberWord(5)).toBe('five')
    expect(numberWord(15)).toBe('fifteen')
    expect(numberWord(42)).toBe('42')
  })

  it('lists only the stats that gained', () => {
    expect(gainsOf({ body: 0.7, mind: 0 })).toEqual([{ stat: 'Body', amount: 0.7 }])
    expect(gainsOf({ body: 0, mind: 0 })).toEqual([])
  })
})

describe('journal export', () => {
  it('writes the oldest day first, with gains and verdicts', () => {
    const entries = newestFirst([
      entry(0, { body: 0.5, text: 'Ran 6km.', systemMessage: 'The distance has been recorded.', hour: 21 }),
      entry(1, { mind: 0.3, text: 'Read two chapters.', systemMessage: 'Attention held, though only barely.', hour: 9 }),
    ])
    const text = journalText(entries, { email: 'you@example.com' })
    expect(text).toContain('Journal of you@example.com')
    expect(text.indexOf('Read two chapters.')).toBeLessThan(text.indexOf('Ran 6km.'))
    expect(text).toContain('09:00  [Mind +0.3]')
    expect(text).toContain('System: The distance has been recorded.')
  })
})
