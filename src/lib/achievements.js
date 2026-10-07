// Achievements: fixed milestones the System marks. Each is checked from the
// person's record; once earned it is saved and kept for good (even if, say, the
// skill that earned it is later demoted). Some grant a title the person can wear.
// Unearned achievements are never shown: they are discovered by earning them.
//
// `check` receives { entries, stats, skills, playerClass, classDay }.

import { dailyCap, entriesByDay } from './stats.js'

export const ACHIEVEMENTS = [
  // Record
  { key: 'first-entry', group: 'Record', name: 'First Mark', how: 'Record a first deed.',
    check: (c) => c.entries.length >= 1 },
  { key: 'entries-100', group: 'Record', name: 'Hundred Deeds', how: 'Record 100 entries.',
    check: (c) => c.entries.length >= 100 },
  { key: 'entries-365', group: 'Record', name: 'The Long Ledger', how: 'Record 365 entries.', title: 'Keeper of the Ledger',
    check: (c) => c.entries.length >= 365 },

  // Streak
  { key: 'streak-7', group: 'Streak', name: 'Unbroken', how: 'Hold a 7-day streak.', title: 'the Unbroken',
    check: (c) => c.stats.longestStreak >= 7 },
  { key: 'streak-30', group: 'Streak', name: 'Iron Habit', how: 'Hold a 30-day streak.', title: 'the Relentless',
    check: (c) => c.stats.longestStreak >= 30 },
  { key: 'streak-100', group: 'Streak', name: 'Hundred Days', how: 'Hold a 100-day streak.', title: 'Who Did Not Falter',
    check: (c) => c.stats.longestStreak >= 100 },

  // Stats
  { key: 'body-10', group: 'Stats', name: 'Tempered Flesh', how: 'Reach Body Lv. 10.',
    check: (c) => Math.floor(c.stats.body) >= 10 },
  { key: 'body-25', group: 'Stats', name: 'Flesh of Iron', how: 'Reach Body Lv. 25.', title: 'the Iron-Bodied',
    check: (c) => Math.floor(c.stats.body) >= 25 },
  { key: 'mind-10', group: 'Stats', name: 'Sharpened Mind', how: 'Reach Mind Lv. 10.',
    check: (c) => Math.floor(c.stats.mind) >= 10 },
  { key: 'mind-25', group: 'Stats', name: 'Honed Edge', how: 'Reach Mind Lv. 25.', title: 'the Learned',
    check: (c) => Math.floor(c.stats.mind) >= 25 },
  { key: 'will-5', group: 'Stats', name: 'Resolve', how: 'Reach Will Lv. 5.',
    check: (c) => c.stats.will >= 5 },
  { key: 'will-10', group: 'Stats', name: 'Unyielding', how: 'Reach Will Lv. 10.', title: 'the Unyielding',
    check: (c) => c.stats.will >= 10 },

  // Skills
  { key: 'skill-first', group: 'Skills', name: 'Proven', how: 'Earn a first skill.',
    check: (c) => Object.values(c.skills).some((s) => s.unlocked) },
  { key: 'skill-rank-5', group: 'Skills', name: 'Mastery', how: 'Raise a skill to Rank V.', title: 'Master of One',
    check: (c) => Object.values(c.skills).some((s) => s.rank >= 5) },
  { key: 'skills-5', group: 'Skills', name: 'Many Hands', how: 'Hold five skills at once.', title: 'the Versatile',
    check: (c) => Object.values(c.skills).filter((s) => s.rank > 0).length >= 5 },
  { key: 'skill-restored', group: 'Skills', name: 'Reclaimed', how: 'Restore a Lost skill.', title: 'the Returned',
    check: (c) => Object.values(c.skills).some((s) => s.everRestored) },

  // Class
  { key: 'class-assigned', group: 'Class', name: 'Marked', how: 'Receive a class.',
    check: (c) => Boolean(c.playerClass) },
  { key: 'class-evolved', group: 'Class', name: 'Second Form', how: 'Evolve a class.', title: 'the Remade',
    check: (c) => Boolean(c.playerClass?.evolvedName) },

  // Secret deeds
  { key: 'before-the-bell', group: 'Hidden', name: 'Before the Bell',
    how: 'Record a deed between 3 and 5 in the morning.', title: 'Who Rises in the Dark',
    check: (c) => c.entries.some((e) => [3, 4].includes(new Date(e.createdAt).getHours())) },
  { key: 'idle-hands', group: 'Hidden', name: 'Idle Hands',
    how: 'Submit an entry the System finds worthless.',
    check: (c) => c.entries.some((e) => e.body === 0 && e.mind === 0) },
  { key: 'at-the-limit', group: 'Hidden', name: 'At the Limit',
    how: "Reach the day's limit in a stat.",
    check: (c) =>
      entriesByDay(c.entries, c.classDay).some((day) => {
        const cap = dailyCap(day.key, c.classDay)
        return day.body >= cap || day.mind >= cap
      }) },
]

export const ACHIEVEMENTS_BY_KEY = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.key, a]))

// Keys of every achievement the record currently meets.
export function earnedKeys(context) {
  return ACHIEVEMENTS.filter((a) => a.check(context)).map((a) => a.key)
}

// Titles the person may wear: those granted by achievements they have earned.
export function availableTitles(earned) {
  return ACHIEVEMENTS.filter((a) => a.title && earned[a.key]).map((a) => a.title)
}
