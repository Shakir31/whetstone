import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { classEvent, className, finalFormHints, readFinalForm, readOutcome, readRhythm } from './classes.js'
import { dayKeys, daysAgo, entry, freezeTime, unfreezeTime } from '../test/helpers.js'

// Rhythm over days 0..(last) counted from 1 September 2026, viewed on day `today`.
const rhythm = (recorded, today) => readRhythm(new Set(dayKeys(recorded)), dayKeys([0])[0], dayKeys([today])[0])
const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i)
const sets = (counts) => Object.fromEntries(Object.entries(counts).map(([p, n]) => [p, new Set(range(1, n).map(String))]))

describe('temperament', () => {
  it('needs a week before it can be read', () => {
    expect(rhythm(range(0, 4), 4).temperament).toBeNull()
  })

  it('is steadfast when nearly every day is kept', () => {
    // 27 of 30 days, never more than 2 in a row missed.
    const kept = range(0, 29).filter((d) => ![5, 12, 20].includes(d))
    expect(rhythm(kept, 29)).toMatchObject({ temperament: 'steadfast', maxGap: 1 })
  })

  it('is measured with a steady rhythm of rest', () => {
    // Four days on, two days off, repeated.
    const kept = range(0, 29).filter((d) => d % 6 < 4)
    expect(rhythm(kept, 29).temperament).toBe('measured')
  })

  it('is restless with long streaks and long silences', () => {
    const kept = [...range(0, 9), ...range(18, 27)]
    expect(rhythm(kept, 29)).toMatchObject({ temperament: 'restless', longestRun: 10 })
  })

  it('is wavering when sparse and irregular', () => {
    expect(rhythm([0, 4, 11, 13, 22], 29).temperament).toBe('wavering')
  })

  it('does not count today as missed before it is over', () => {
    expect(rhythm(range(0, 28), 29).maxGap).toBe(0)
  })
})

describe('outcome', () => {
  const ironReader = { baseClass: 'ironclad', evolvedPath: 'knowledge' }

  it('deepens when the class path dominates', () => {
    expect(readOutcome(ironReader, sets({ strength: 20, knowledge: 10 }))).toEqual({ outcome: 'deepened', newPath: null })
  })

  it('stays bound when the first evolution path is still the second', () => {
    expect(readOutcome(ironReader, sets({ strength: 15, knowledge: 10 }))).toEqual({ outcome: 'bound', newPath: null })
  })

  it('turns when a different path takes second place', () => {
    expect(readOutcome(ironReader, sets({ strength: 15, endurance: 10, knowledge: 3 }))).toEqual({
      outcome: 'turned',
      newPath: 'endurance',
    })
  })

  it('reads a Hunter by its balance', () => {
    const hunter = { baseClass: 'hunter', evolvedPath: 'craft' }
    expect(readOutcome(hunter, sets({ strength: 5, craft: 5, knowledge: 5 })).outcome).toBe('deepened')
    expect(readOutcome(hunter, sets({ craft: 12, knowledge: 3 })).outcome).toBe('bound')
    expect(readOutcome(hunter, sets({ endurance: 12, knowledge: 3 }))).toEqual({ outcome: 'turned', newPath: 'endurance' })
  })
})

describe('reading the record', () => {
  beforeEach(freezeTime)
  afterEach(unfreezeTime)

  const paths = { weightlifting: 'strength', reading: 'knowledge', running: 'endurance' }
  const evolved = { baseClass: 'ironclad', evolvedName: 'Iron Reader', evolvedPath: 'knowledge', evolvedAt: daysAgo(20) }

  it('counts only days since the first evolution', () => {
    const entries = [
      ...range(0, 20).map((n) => entry(n, { tags: ['weightlifting'] })),
      ...range(30, 60).map((n) => entry(n, { tags: ['running'] })), // before the evolution
    ]
    expect(readFinalForm(evolved, entries, paths)).toMatchObject({ outcome: 'deepened', temperament: 'steadfast', recorded: 21 })
  })

  it('gives nothing before the first evolution', () => {
    expect(readFinalForm({ baseClass: 'ironclad', evolvedAt: null }, [], paths)).toBeNull()
  })

  it('turns its reading into two hints', () => {
    expect(finalFormHints(evolved, { outcome: 'bound', temperament: 'restless' })).toEqual([
      'The written word still holds the form.',
      'So far, the path is kept in bursts, with long silences between.',
    ])
    expect(finalFormHints(evolved, { outcome: 'turned', newPath: 'endurance', temperament: null })).toEqual([
      'Something new pulls at the form: the long road.',
      'The System is watching how you keep to the path.',
    ])
  })

  it('names the class by its latest form and reports the final evolution', () => {
    const final = { ...evolved, finalName: 'Keeper of the Iron Library', finalDescription: 'Every page turned.' }
    expect(className(final)).toBe('Keeper of the Iron Library')
    expect(classEvent({ playerClass: evolved, entries: [], paths }, { playerClass: final, entries: [], paths })).toMatchObject({
      kind: 'evolved',
      from: 'Iron Reader',
      name: 'Keeper of the Iron Library',
    })
  })
})
