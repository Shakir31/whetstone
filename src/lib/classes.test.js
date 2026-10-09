import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { classDayOf, classEvent, classProgress, evolutionHint } from './classes.js'
import { daysAgo, entry, freezeTime, unfreezeTime } from '../test/helpers.js'

beforeEach(freezeTime)
afterEach(unfreezeTime)

const paths = { weightlifting: 'strength', running: 'endurance', reading: 'knowledge' }
const ironclad = { baseClass: 'ironclad', title: 'Who Lifts Before Dawn', assignedAt: daysAgo(60), evolvedName: null }
const lifting = (days) => days.map((n) => entry(n, { tags: ['weightlifting'] }))
const firstDays = (count) => Array.from({ length: count }, (_, i) => i)

describe('classProgress', () => {
  it('gains a rank every 15 path days', () => {
    expect(classProgress(ironclad, lifting(firstDays(14)), paths)).toMatchObject({ rank: 1, daysToNextRank: 1 })
    expect(classProgress(ironclad, lifting(firstDays(15)), paths).rank).toBe(2)
    expect(classProgress(ironclad, lifting(firstDays(30)), paths).rank).toBe(3)
    expect(classProgress(ironclad, lifting(firstDays(59)), paths).rank).toBe(4)
  })

  it('ignores days before the class was assigned', () => {
    const recent = { ...ironclad, assignedAt: daysAgo(5) }
    expect(classProgress(recent, lifting(firstDays(30)), paths).pathDays).toBe(6) // days 0-5
  })

  it('counts only the class path, except for a Hunter', () => {
    const mixed = [entry(1, { tags: ['running'] }), entry(2, { tags: ['reading'] }), entry(3, { tags: ['weightlifting'] })]
    expect(classProgress(ironclad, mixed, paths).pathDays).toBe(1)
    expect(classProgress({ ...ironclad, baseClass: 'hunter' }, mixed, paths).pathDays).toBe(3)
  })

  it('leans toward the second path followed most', () => {
    const entries = [...lifting(firstDays(5)), entry(1, { tags: ['reading'] }), entry(2, { tags: ['reading'] }), entry(3, { tags: ['running'] })]
    expect(classProgress(ironclad, entries, paths).leaning).toBe('knowledge')
  })
})

describe('evolutionHint', () => {
  it('stays vague at Rank I and names the leaning from Rank II', () => {
    expect(evolutionHint(1, 'knowledge')).toBe('The form is not yet set.')
    expect(evolutionHint(2, 'knowledge')).toBe('The form leans toward the written word.')
    expect(evolutionHint(2, null)).toBe('The form hardens along its own path.')
  })
})

describe('classEvent', () => {
  it('reports assignment, evolution and rank-ups', () => {
    const none = { playerClass: null, entries: [], paths }
    expect(classEvent(none, { playerClass: ironclad, entries: [], paths })).toMatchObject({ kind: 'assigned', name: 'Ironclad' })

    const evolved = { ...ironclad, evolvedName: 'Iron Reader', evolvedDescription: 'Strength that reads.' }
    expect(classEvent({ playerClass: ironclad, entries: [], paths }, { playerClass: evolved, entries: [], paths })).toMatchObject({
      kind: 'evolved',
      from: 'Ironclad',
      name: 'Iron Reader',
    })

    const before = lifting(firstDays(15).slice(1)) // 14 path days
    const after = [entry(0, { tags: ['weightlifting'] }), ...before] // 15
    expect(classEvent({ playerClass: ironclad, entries: before, paths }, { playerClass: ironclad, entries: after, paths })).toMatchObject({
      kind: 'ranked',
      from: 1,
      to: 2,
    })
  })

  it('reports nothing when nothing changed', () => {
    const state = { playerClass: ironclad, entries: lifting([0]), paths }
    expect(classEvent(state, state)).toBeNull()
  })
})

describe('classDayOf', () => {
  it('is the local day of assignment, or null', () => {
    expect(classDayOf(null)).toBeNull()
    expect(classDayOf({ assignedAt: daysAgo(0) })).toBe('2026-10-07')
  })
})
